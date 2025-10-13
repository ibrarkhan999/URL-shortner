import crypto from "crypto"


export const generateRandomToken = (digit = 8) => {
    const min = 10 ** (digit - 1)
    const max = 10 ** digit

    return crypto.randomInt(min, max).toString()
}