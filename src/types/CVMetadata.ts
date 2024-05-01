export interface CVData {
  metadata: Metadata;
  certificate: Certificate[];
  education: Education[];
  projects: Project[];
  publications: Publication[];
  bibliography: Bibliography;
  skills: Skill[];
}

export type Certificate = CVHonor;
export type Education = CVEntry;
export type Project = CVEntry;
export type Publication = CVEntry;
export type Skill = CVSkill;

export interface CVHonor {
  date: string;
  title: string;
  issuer: string;
  uri: string;
  location: string;
}

export interface CVSkill {
  type: string;
  info: string[];
}

export interface CVEntry {
  title: string;
  society: string;
  date: string;
  location: string | Location;
  description: string[];
  logo: string;
  tags: string[];
}

export interface Metadata {
  firstName: string;
  lastName: string;
  headerQuote: string[];
  awesomeColor: string;
  profilePhoto: string;
  varLanguage: string;
  varEntrySocietyFirst: boolean;
  varDisplayLogo: boolean;
  cvFooter: string;
  letterFooter: string;
  personalInfo: PersonalInfo;
}

export interface PersonalInfo {
  github: string;
  phone: string;
  email: string;
  linkedin: string;
  homepage: string;
  orcid: string;
}

export interface Location {
  github: string;
}

export interface Bibliography {
  bibPath: string;
  refStyle: string;
}
