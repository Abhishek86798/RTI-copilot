"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveGuestApplication, type GuestApplication } from "@/lib/client/guest-storage";

type Candidate = {
  authority: {
    id: string;
    authorityName: string;
    pioDesignation: string;
    filingAddress: string;
    verifyAt?: string;
    notes?: string;
  };
  confidence: number;
  reason: string;
};

type Step = "intake" | "confirm" | "draft";

const PORTAL_LIMIT = 3000;

/**
 * The model's confidence number isn't a calibrated probability, so showing it
 * as "98% match" overstates what we know. Buckets convey the same signal
 * without implying precision we don't have.
 */
function confidenceLabel(confidence: number): { text: string; variant: "default" | "secondary" | "outline" } {
  if (confidence >= 0.9) return { text: "Strong match", variant: "default" };
  if (confidence >= 0.6) return { text: "Likely match", variant: "default" };
  if (confidence >= 0.5) return { text: "Possible match", variant: "secondary" };
  return { text: "Uncertain — verify", variant: "outline" };
}

export default function Home() {
  const [step, setStep] = useState<Step>("intake");
  const [grievance, setGrievance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [extractedReferences, setExtractedReferences] = useState<string[]>([]);
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);

  const [items, setItems] = useState<string[]>([]);
  const [portalText, setPortalText] = useState("");
  const [fullText, setFullText] = useState("");
  const [lifeOrLibertyFlag, setLifeOrLibertyFlag] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const wordCount = grievance.trim().split(/\s+/).filter(Boolean).length;

  async function handleRoute() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/route-authority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grievance }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong while routing your grievance.");
      setCandidates(data.candidates);
      setExtractedReferences(data.extractedReferences);
      setLowConfidence(data.lowConfidence);
      setSelectedAuthorityId(data.candidates[0]?.authority.id ?? null);
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDraft() {
    if (!selectedAuthorityId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grievance, authorityId: selectedAuthorityId, extractedReferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong while drafting your application.");

      setItems(data.items);
      setPortalText(data.portalText);
      setFullText(data.fullText);
      setLifeOrLibertyFlag(data.lifeOrLibertyFlag);

      const authority = candidates.find((c) => c.authority.id === selectedAuthorityId)?.authority;
      const id = crypto.randomUUID();
      const app: GuestApplication = {
        id,
        createdAt: new Date().toISOString(),
        grievance,
        authorityId: selectedAuthorityId,
        authorityName: authority?.authorityName ?? "",
        extractedReferences,
        items: data.items,
        fullText: data.fullText,
        portalText: data.portalText,
        lifeOrLibertyFlag: data.lifeOrLibertyFlag,
        status: "drafting",
      };
      saveGuestApplication(app);
      setApplicationId(id);
      setStep("draft");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function updatePortalText(value: string) {
    setPortalText(value);
    if (applicationId) {
      const authority = candidates.find((c) => c.authority.id === selectedAuthorityId)?.authority;
      saveGuestApplication({
        id: applicationId,
        createdAt: new Date().toISOString(),
        grievance,
        authorityId: selectedAuthorityId ?? "",
        authorityName: authority?.authorityName ?? "",
        extractedReferences,
        items,
        fullText,
        portalText: value,
        lifeOrLibertyFlag,
        status: "drafting",
      });
    }
  }

  const selectedCandidate = candidates.find((c) => c.authority.id === selectedAuthorityId);

  return (
    <div className="flex flex-1 justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">RTI Copilot</h1>
          <p className="text-sm text-muted-foreground">
            Describe your grievance in plain language — we route it to the right authority and draft a
            legally valid RTI request.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t continue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "intake" && (
          <Card>
            <CardHeader>
              <CardTitle>What happened?</CardTitle>
              <CardDescription>
                Write it the way you&apos;d tell a friend. No need to know which department is involved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={grievance}
                onChange={(e) => setGrievance(e.target.value)}
                placeholder="e.g. My father's pension was stopped last month without any notice, and no one at the office will explain why..."
                rows={7}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{wordCount} words (minimum 15)</span>
              </div>
              <Button onClick={handleRoute} disabled={loading || wordCount < 15} className="w-full">
                {loading ? "Finding the right authority…" : "Find the right authority"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm the Public Authority</CardTitle>
              <CardDescription>
                Filing with the wrong authority delays your request under Section 6(3). Review our match
                before continuing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowConfidence && (
                <Alert>
                  <AlertTitle>We&apos;re not confident about this match</AlertTitle>
                  <AlertDescription>
                    No authority in our directory clearly holds these records. Please verify the correct
                    office before filing — check the department&apos;s own website or the RTI Online
                    portal. Filing with the wrong authority restarts your 30-day clock under Section 6(3).
                  </AlertDescription>
                </Alert>
              )}

              {candidates.map((c) => (
                <button
                  key={c.authority.id}
                  onClick={() => setSelectedAuthorityId(c.authority.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedAuthorityId === c.authority.id
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{c.authority.authorityName}</span>
                    <Badge variant={confidenceLabel(c.confidence).variant}>
                      {confidenceLabel(c.confidence).text}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.authority.pioDesignation}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.reason}</p>
                </button>
              ))}

              {extractedReferences.length > 0 && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="font-medium">Reference details we&apos;ll preserve: </span>
                  {extractedReferences.join(", ")}
                </div>
              )}

              <Separator />

              {selectedCandidate && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Filing address: {selectedCandidate.authority.filingAddress}</p>
                  {selectedCandidate.authority.notes && (
                    <p className="rounded-lg bg-muted p-3">
                      <span className="font-medium text-foreground">Worth knowing: </span>
                      {selectedCandidate.authority.notes}
                    </p>
                  )}
                  {selectedCandidate.authority.verifyAt && (
                    <p className="text-xs">
                      Confirm the exact office for your area at{" "}
                      {selectedCandidate.authority.verifyAt.startsWith("http") ? (
                        <a
                          href={selectedCandidate.authority.verifyAt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {selectedCandidate.authority.verifyAt}
                        </a>
                      ) : (
                        selectedCandidate.authority.verifyAt
                      )}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("intake")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleDraft}
                  disabled={loading || !selectedAuthorityId}
                  variant={lowConfidence ? "outline" : "default"}
                  className="flex-1"
                >
                  {loading ? "Drafting…" : lowConfidence ? "Draft anyway" : "Draft my application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "draft" && (
          <Card>
            <CardHeader>
              <CardTitle>Your RTI application</CardTitle>
              <CardDescription>
                Addressed to {selectedCandidate?.authority.authorityName}. Edit freely before filing — you
                have final say.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lifeOrLibertyFlag && (
                <Alert>
                  <AlertTitle>Flagged under Section 7(1)</AlertTitle>
                  <AlertDescription>48-Hour Statutory Window Applicable</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Portal-ready draft</span>
                  <span
                    className={`text-xs ${
                      portalText.length > PORTAL_LIMIT ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {portalText.length} / {PORTAL_LIMIT} characters
                  </span>
                </div>
                <Textarea
                  value={portalText}
                  onChange={(e) => updatePortalText(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This fits the RTI Online portal&apos;s text field. The full itemized version below is
                  always available to attach as a PDF.
                </p>
              </div>

              <Separator />

              <div className="space-y-1">
                <span className="text-sm font-medium">Full itemized request</span>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>

              <Button variant="outline" onClick={() => setStep("intake")} className="w-full">
                Start a new application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
