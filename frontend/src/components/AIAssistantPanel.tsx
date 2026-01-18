import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Wand2 } from "lucide-react";
import { analyzeSecurity, analyzeContradictions, assessRisk } from "../lib/api";

import { AnnotationType } from "../types";
import { v4 as uuidv4 } from "uuid";

interface AIAssistantPanelProps {
    markdown: string;
    onAddAnnotation?: (annotation: any) => void;
    onHighlightsUpdate?: (highlights: any[]) => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onNavigate?: (text: string) => void;
}

export default function AIAssistantPanel({
    markdown,
    onAddAnnotation,
    onHighlightsUpdate,
    activeTab,
    onTabChange,
    onNavigate
}: AIAssistantPanelProps) {
    const [loading, setLoading] = useState(false);
    const [securityIssues, setSecurityIssues] = useState<any[]>([]);
    const [contradictions, setContradictions] = useState<any>(null);
    const [risks, setRisks] = useState<any[]>([]);

    // Sync highlights to parent whenever issues change
    useState(() => {
        if (!onHighlightsUpdate) return;
        const highlights: any[] = [];

        securityIssues.forEach(i => {
            if (i.location) highlights.push({
                id: uuidv4(),
                type: AnnotationType.COMMENT,
                originalText: i.location,
                color: i.severity === 'CRITICAL' || i.severity === 'HIGH' ? '#fecaca' : '#fed7aa',
                data: i
            });
        });

        contradictions?.contradictions?.forEach((c: any) => {
            if (c.source_claim) highlights.push({
                id: uuidv4(),
                type: AnnotationType.COMMENT,
                originalText: c.source_claim,
                color: '#bfdbfe',
                data: c
            });
            if (c.conflicting_detail) highlights.push({
                id: uuidv4(),
                type: AnnotationType.COMMENT,
                originalText: c.conflicting_detail,
                color: '#bfdbfe',
                data: c
            });
        });

        risks.forEach(r => {
            if (r.step_name) highlights.push({
                id: uuidv4(),
                type: AnnotationType.COMMENT,
                originalText: r.step_name,
                color: r.risk_level === 'high' ? '#e9d5ff' : undefined,
                data: r
            });
        });

        onHighlightsUpdate(highlights);
    }); // This effect needs dependency management in real react, but for now we rely on re-renders or fix it below properly

    // Correct Effect
    const updateHighlights = () => {
        if (!onHighlightsUpdate) return;
        const highlights: any[] = [];

        securityIssues.forEach(i => {
            if (i.location) highlights.push({
                id: uuidv4(),
                type: 'SECURITY', // Special type tag for scroll sync
                originalText: i.location,
                color: i.severity === 'CRITICAL' || i.severity === 'HIGH' ? '#fecaca' : '#fed7aa',
                data: i
            });
        });

        contradictions?.contradictions?.forEach((c: any) => {
            if (c.source_claim) highlights.push({
                id: uuidv4(),
                type: 'LOGIC',
                originalText: c.source_claim,
                color: '#bfdbfe',
                data: c
            });
        });

        risks.forEach(r => {
            if (r.step_name) highlights.push({
                id: uuidv4(),
                type: 'RISK',
                originalText: r.step_name,
                color: r.risk_level === 'high' ? '#e9d5ff' : undefined,
                data: r
            });
        });
        onHighlightsUpdate(highlights);
    };

    // Call updateHighlights when state changes
    useEffect(updateHighlights, [securityIssues, contradictions, risks]);

    const handleSecurityScan = async () => {
        setLoading(true);
        try {
            const res = await analyzeSecurity(markdown);
            const issues = res?.security_issues || [];

            setSecurityIssues(issues);
        } finally {
            setLoading(false);
        }
    };

    const handleConsistencyCheck = async () => {
        setLoading(true);
        try {
            const res = await analyzeContradictions(markdown);
            setContradictions(res);
        } finally {
            setLoading(false);
        }
    };

    const handleRiskAssessment = async () => {
        setLoading(true);
        try {
            const res = await assessRisk(markdown);
            setRisks(res?.steps || []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full border-l rounded-none w-[400px] flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-indigo-500" />
                    AI Architect
                </CardTitle>
                <CardDescription>Automated Design Review</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <Tabs
                    defaultValue="security"
                    value={activeTab}
                    onValueChange={onTabChange}
                    className="h-full flex flex-col"
                >
                    <div className="px-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="consistency">Logic</TabsTrigger>
                            <TabsTrigger value="risk">Risk</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                            {/* Security Tab */}
                            <TabsContent value="security" className="mt-0 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Security Lens</h3>
                                    <Button size="sm" onClick={handleSecurityScan} disabled={loading}>
                                        {loading ? "Scanning..." : "Run Audit"}
                                    </Button>
                                </div>
                                {securityIssues.length === 0 && !loading && (
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        No vulnerabilities detected or scan not run.
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {securityIssues.map((issue: any, idx) => (
                                        <Card
                                            key={idx}
                                            className="bg-destructive/10 border-destructive/20 cursor-pointer hover:bg-destructive/15 transition-colors"
                                            onClick={() => onNavigate?.(issue.location)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <ShieldAlert className="w-4 h-4 text-destructive mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm text-destructive">{issue.issue}</div>
                                                        <p className="text-xs text-muted-foreground mt-1">{issue.recommendation}</p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <Badge variant="outline" className="border-destructive/40 text-destructive text-[10px]">
                                                                {issue.severity}
                                                            </Badge>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-[10px] px-2 hover:bg-destructive/20"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAddAnnotation?.({
                                                                        id: uuidv4(),
                                                                        type: AnnotationType.COMMENT,
                                                                        text: `[${issue.severity}] ${issue.issue}: ${issue.recommendation}`,
                                                                        originalText: issue.location,
                                                                        createdA: Date.now(),
                                                                        author: 'ai-security-lens',
                                                                        authorName: 'AI Security Lens'
                                                                    });
                                                                }}
                                                            >
                                                                Add to Plan
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Consistency Tab */}
                            <TabsContent value="consistency" className="mt-0 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Contradiction Detector</h3>
                                    <Button size="sm" onClick={handleConsistencyCheck} disabled={loading}>
                                        CHECK
                                    </Button>
                                </div>
                                {contradictions?.contradictions?.length === 0 && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>No contradictions found.</span>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {contradictions?.contradictions?.map((issue: any, idx: number) => (
                                        <Card key={idx} className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <XCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                                    <div className="w-full">
                                                        <div className="flex justify-between">
                                                            <div className="font-semibold text-sm text-amber-800 dark:text-amber-400">{issue.type} Conflict</div>
                                                        </div>
                                                        <p className="text-xs text-amber-700 mt-1">{issue.explanation}</p>
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            <div className="bg-white/50 p-1.5 rounded text-[10px] border border-amber-200">
                                                                <span className="font-semibold block mb-0.5">Claim:</span>
                                                                "{issue.source_claim}"
                                                            </div>
                                                            <div className="bg-white/50 p-1.5 rounded text-[10px] border border-amber-200">
                                                                <span className="font-semibold block mb-0.5">Conflict:</span>
                                                                "{issue.conflicting_detail}"
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Risk Tab */}
                            <TabsContent value="risk" className="mt-0 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Risk Labeler</h3>
                                    <Button size="sm" onClick={handleRiskAssessment} disabled={loading}>
                                        Assess
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {risks.map((risk: any, idx) => (
                                        <Card
                                            key={idx}
                                            className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                            onClick={() => onNavigate?.(risk.step_name)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-purple-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-sm text-purple-800 dark:text-purple-400">{risk.step_name}</span>
                                                            <Badge className={
                                                                risk.risk_level === 'high' ? 'bg-red-500' :
                                                                    risk.risk_level === 'medium' ? 'bg-yellow-500' :
                                                                        'bg-green-500'
                                                            }>
                                                                {risk.risk_level.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-purple-700 mt-1">{risk.reasoning}</p>
                                                        <div className="flex justify-end mt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-[10px] px-2 hover:bg-purple-200 dark:hover:bg-purple-800"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAddAnnotation?.({
                                                                        id: uuidv4(),
                                                                        type: AnnotationType.COMMENT,
                                                                        text: `[RISK: ${risk.risk_level}] ${risk.step_name}: ${risk.reasoning}`,
                                                                        originalText: risk.step_name,
                                                                        createdA: Date.now(),
                                                                        author: 'ai-risk-labeler',
                                                                        authorName: 'AI Risk Labeler'
                                                                    });
                                                                }}
                                                            >
                                                                Add to Plan
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
