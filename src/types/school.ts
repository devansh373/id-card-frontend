export interface SchoolProfile {
  id: number;
  name: string;
  code: string;
  adminEmail: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  affiliationNumber?: string;
  registrationNumber?: string;
  registrationDetails?: string;
  authoritySignatureUrl?: string;
  principalSignatureUrl?: string;
  logoUrl?: string;
  templateUrl?: string;
  imagekitPublicKey?: string;
  imagekitUrlEndpoint?: string;
  imagekitFolder?: string;
  createdAt: string;
}

export type UpdateSchoolSetupPayload = Partial<Omit<SchoolProfile, 'id' | 'createdAt' | 'authoritySignatureUrl' | 'principalSignatureUrl' | 'logoUrl' | 'templateUrl' | 'imagekitPublicKey' | 'imagekitUrlEndpoint' | 'imagekitFolder' | 'code' | 'adminEmail'>> & {
  logo?: File;
  template?: File;
};

export interface UpdateImageKitPayload {
  imagekitPublicKey: string;
  imagekitPrivateKey: string;
  imagekitUrlEndpoint: string;
  imagekitFolder: string;
}

export interface UploadSignaturesPayload {
  principal?: File;
  authority?: File;
}
