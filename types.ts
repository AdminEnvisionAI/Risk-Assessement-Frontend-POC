
export interface RiskSchemaItem {
  id: string;
  label: string;
  why_necessary: string;
  source_hint: string;
}

export interface RiskSchemaCategory {
  [key: string]: RiskSchemaItem[];
}

export interface RiskSchemaStructure {
  external: RiskSchemaCategory;
  internal: RiskSchemaCategory;
}

export interface CompanyProfile {
  sector: string;
  key_geographies: string[];
  business_model_notes: string;
  assumptions: string;
}

export interface RiskSchemaRoot {
  version: string;
  company_profile: CompanyProfile;
  schema: RiskSchemaStructure;
}

export interface AssessmentItem {
  rating: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  evidence: string;
  reasoning: string;
}

export interface RiskAssessmentResult {
  assessment: Record<string, AssessmentItem>;
}

export interface FinalizerResult {
  conclusion: string;
  references: string[];
}

export interface ResearchedSection {
  section_index: number;
  section_name: string;
  content: string;
  completed_at: { $date: string };
}

export interface StepContext {
  [key: string]: any;
}

export interface StepBase {
  status: string;
  completed_at?: { $date: string };
  context?: StepContext;
}

export interface RiskSchemaDesignStep extends StepBase {
  result: {
    risk_schema: RiskSchemaRoot;
  };
}

export interface RiskAssessmentStep extends StepBase {
  result: RiskAssessmentResult;
}

export interface ValidatedRiskReportResult {
  company: string;
  timestamp_utc: string;
  methodology: {
    llm_model: string;
    web_search_tool: string;
    notes: string;
  };
  risk_schema: RiskSchemaRoot;
  results: Record<string, AssessmentItem>;
  raw_assessment?: {
    assessment: Record<string, AssessmentItem>;
  };
}

export interface ValidatedRiskReportStep extends StepBase {
  result: ValidatedRiskReportResult;
}

export interface ReportStructurePlanStep extends StepBase {
  result: {
    section_count: number;
    sections: Array<{
      section_name: string;
      sub_sections: string[];
    }>;
    report_structure_text: string;
  };
}

export interface FinalizerStep extends StepBase {
  result: FinalizerResult;
}

export interface RiskData {
  _id: { $oid: string };
  run_id: string;
  company_name: string;
  status: string;
  steps: {
    risk_schema_design: RiskSchemaDesignStep;
    risk_assessment: RiskAssessmentStep;
    validated_risk_report: ValidatedRiskReportStep;
    report_structure_plan?: ReportStructurePlanStep;
    finalizer: FinalizerStep;
  };
  researched_sections: ResearchedSection[];
  final_report_content: string;
  created_at?: { $date: string };
  updated_at?: { $date: string };
}
