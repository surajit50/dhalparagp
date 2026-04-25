export type PincodeResponse = {
  district: string
  state: string
  postOffices: string[]
}

export async function fetchAddressFromPin(pin: string): Promise<PincodeResponse | null> {
  if (pin.length !== 6) return null

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)

    const data = await res.json()

    if (!data || data[0].Status !== "Success") return null

    const postOffices = data[0].PostOffice

    return {
      district: postOffices[0].District,
      state: postOffices[0].State,
      postOffices: postOffices.map((po: any) => po.Name),
    }
  } catch (error) {
    console.error("PIN lookup failed", error)
    return null
  }
}
