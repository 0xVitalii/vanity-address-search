import fs from 'fs';
import {ethers} from 'ethers';
const factoryContract = '';
const factoryByteCode = '';



async function findVanityAddress(bytecode: any) {
    let salt = "0x0000";
    while (true) {
        let computedAddress = ethers.getCreate2Address(
            factoryContract,
            ethers.zeroPadValue(ethers.hexlify(salt), 32),
            ethers.keccak256(bytecode)
        );

        if (computedAddress.startsWith('0x8')) { // how you want your addy to look like. more cool = more computation and time!
            console.log(`Found vanity address: ${computedAddress} with salt: ${salt}`);
            break;
        }

        salt = ethers.toBeHex(ethers.getNumber(salt)+1);
    }

    return salt;
}

findVanityAddress(factoryByteCode);