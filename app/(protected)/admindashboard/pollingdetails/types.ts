export interface PollingStation {
  id: string
  stationNumber: string
  location: string
  boothAddress: string
  totalVoters: number
  assignedMember?: string
}

export interface GramSansadMember {
  id: string
  name: string
  designation?: string
  contactNumber?: string
}

