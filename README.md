# Vanity Address Utility

This tool helps you find the right "salt" to deploy a smart contract on any EVM blockchain with a vanity address—an address that looks special or unique. By using a factory address and its bytecode, you can brute-force the salt needed to determine the vanity address before the contract is even deployed.

Interestingly, you can send ETH or tokens to a contract address before it’s deployed and then withdraw them once the deployment is complete.

This utility is written in TypeScript, so you can run it using Node.js. It requires the Ethers.js library as a dependency.

## How to Run the Script

1. **Deploy a Factory Smart Contract**

   First, deploy your own factory smart contract and obtain its address and bytecode. You will need to set the `factoryContract` and `factoryByteCode` variables in index.ts using the obtained values. The bytecode can be retrieved by calling the `getBytecode(address _sender)` function from the factory smart contract:

   ```solidity
   pragma solidity ^0.8.20;

   contract FactoryAssembly {
       event Deployed(address addr, uint256 salt);

       function getBytecode(address _sender)
           public
           pure
           returns (bytes memory)
       {
           bytes memory bytecode = type(ZerosToken).creationCode;
           return abi.encodePacked(bytecode, abi.encode(_sender));
       }

       function getAddress(bytes memory bytecode, uint256 _salt)
           public
           view
           returns (address)
       {
           bytes32 hash = keccak256(
               abi.encodePacked(
                   bytes1(0xff), address(this), _salt, keccak256(bytecode)
               )
           );
           return address(uint160(uint256(hash)));
       }

       function deploy(bytes memory bytecode, uint256 _salt) public payable {
           address addr;
           assembly {
               addr := create2(
                   callvalue(), 
                   add(bytecode, 0x20),
                   mload(bytecode), 
                   _salt 
               )
               if iszero(extcodesize(addr)) { revert(0, 0) }
           }
           emit Deployed(addr, _salt);
       }
   }

   contract ZerosToken {
       // Your code here
   }
   ```

    You can refer to a factory contract I deployed as an example: [Factory Contract on Etherscan](https://optimistic.etherscan.io/address/0xfe0417c2e1ed375ea1baec576fce266555a1de23).

   Here is an example of a deployed smart contract with a vanity address starting with zeros: [Vanity Address Contract on Etherscan](https://optimistic.etherscan.io/address/0x00000f15b579291901007124d3605f11b46e2fbf).

   I personally deployed an ERC-20 token, but you are free to replace the ERC-20 token code in the factory smart contract with any other contract.


2. **Configure Vanity Address Requirements**

   Modify the `startsWith('0x00000')` function in index.ts with the desired prefix for your vanity address. The more characters you specify, the longer the computation will take. Five characters can be brute-forced relatively easily, while six or more may require hours or days to find the correct salt.

3. **Run the Script**

   ```bash
   npm run build
   node dist/index.js
   ```

## Resources

- [EIP 1014: Skinny CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [CREATE2 on Solidity By Example](https://solidity-by-example.org/app/create2/)
- [CREATE2 YouTube Video](https://www.youtube.com/watch?v=-XT2YCQGVEQ)
- [Compute Contract Address Before Deployment YouTube Guide](https://www.youtube.com/watch?v=883-koWrsO4)