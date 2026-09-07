export type Contact = { label: string; value: string };
export type ResumeSection = Record<string, unknown>;

export type Resume = {
  name: string;
  contact: Contact[];
  summary: string;
  skills: string[];
  experience: ResumeSection[];
  projects: ResumeSection[];
  education: ResumeSection[];
};

export type JobDescription = {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  requirements: string[];
  nice_to_have: string[];
  responsibilities: string[];
};

export const emptyResume = (): Resume => ({
  name: "", contact: [], summary: "", skills: [], experience: [], projects: [], education: [],
});

export const emptyJd = (): JobDescription => ({
  title: "", company: "", location: "", employment_type: "", requirements: [], nice_to_have: [], responsibilities: [],
});

export function normalizeResume(value: unknown): Resume {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    ...emptyResume(),
    ...source,
    name: typeof source.name === "string" ? source.name : "",
    summary: typeof source.summary === "string" ? source.summary : "",
    contact: Array.isArray(source.contact) ? source.contact as Contact[] : [],
    skills: Array.isArray(source.skills) ? source.skills.map(String) : [],
    experience: Array.isArray(source.experience) ? source.experience as ResumeSection[] : [],
    projects: Array.isArray(source.projects) ? source.projects as ResumeSection[] : [],
    education: Array.isArray(source.education) ? source.education as ResumeSection[] : [],
  };
}

export function normalizeJd(value: unknown): JobDescription {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    ...emptyJd(), ...source,
    title: typeof source.title === "string" ? source.title : "",
    company: typeof source.company === "string" ? source.company : "",
    location: typeof source.location === "string" ? source.location : "",
    employment_type: typeof source.employment_type === "string" ? source.employment_type : "",
    requirements: Array.isArray(source.requirements) ? source.requirements.map(String) : [],
    nice_to_have: Array.isArray(source.nice_to_have) ? source.nice_to_have.map(String) : [],
    responsibilities: Array.isArray(source.responsibilities) ? source.responsibilities.map(String) : [],
  };
}
