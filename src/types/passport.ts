export interface PassportData {
  _id?: string;
  passportNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  placeOfBirth?: string;
  nationality: string;
  gender: string;
  dateOfIssue: Date | string;
  dateOfExpiry: Date | string;
  placeOfIssue?: string;
  mrzLine1?: string;
  mrzLine2?: string;
  extractedText?: string;
  imageUrl?: string;
  confidence?: number;
  verifiedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ExtractedData extends PassportData {
  filename?: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PassportsResponse {
  success: boolean;
  data: PassportData[];
  pagination: PaginationData;
}

export interface StatisticsData {
  totalPassports: number;
  totalNationalities: number;
  expiringThisMonth: number;
  expiredPassports: number;
  nationalities: string[];
}