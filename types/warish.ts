import type {
  WarishApplication,
  WarishDetail,

  Gender,
  MaritialStatus,
  LivingStatus,
  FamilyRelationship,
  ApplicationStatus,
  ModificationRequestStatus,
  
  WarishModificationRequest
} from "@prisma/client"

// Extended types with relations
export interface WarishApplicationProps extends WarishApplication {
  warishDetails?: WarishDetailProps[]
  modificationRequests?: WarishModificationRequest[]

}

export interface WarishDetailProps extends WarishDetail {
  children?: WarishDetailProps[]
  parent?: WarishDetailProps | null
  warishApplication?: WarishApplication
}



// Form types
export interface WarishApplicationFormData {
  applicantName: string
  applicantMobileNumber: string
  nameOfDeceased: string
  relationwithdeceased: string
  dateOfDeath: Date
  gender: Gender
  maritialStatus: MaritialStatus
  fatherName: string
  spouseName?: string
  villageName: string
  postOffice: string
}

export interface WarishDetailFormData {
  name: string
  gender: Gender
  relation: FamilyRelationship
  livingStatus: LivingStatus
  maritialStatus: MaritialStatus
  hasbandName?: string
  parentId?: string
  warishApplicationId: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Filter types
export interface WarishApplicationFilters {
  status?: ApplicationStatus
  dateFrom?: Date
  dateTo?: Date
  applicantName?: string
  acknowlegment?: string
}



export type WarishDetailType = {
  id: string;
  name: string;
  gender: string;
  relation: string;
  livingStatus: string;
  maritialStatus: string;
  hasbandName: string | null;
  parentId: string | null;
  warishApplicationId: string;
  children: WarishDetailType[];
}; 


