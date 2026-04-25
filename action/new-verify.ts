'use server'

import { getUserEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "@/lib/db";


export const newVerification = async(token:string)=>{

    const exitingToken= await getVerificationTokenByToken(token)

    if(!exitingToken){
        return {error : "Token does not exist"}
    }
    
    const hasExpired  = new Date(exitingToken.expires) < new Date();


    if(hasExpired)
    {
        return {error : "Token has expired"}
    }

    const existingUser = await getUserEmail(exitingToken.email)

    if(!existingUser){
        return {error : "Email does not exist"}
    }

    try {
        await db.user.update({
            where: { id: existingUser.id },
            data: {
                emailVerified: new Date(),
                email: exitingToken.email
            }
        })
    } catch (error) {
        console.error("Verification update error:", error);
        return { error: "Failed to verify email. User record might be missing." };
    }

    await db.verificationToken.delete({
        where:{id:exitingToken.id}
    })

    return {success : "Email verified"}



}