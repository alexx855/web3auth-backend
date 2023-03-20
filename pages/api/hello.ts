// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chainConfig, clientId, web3AuthNetwork } from '@/services/web3auth';
import Web3Auth from '@web3auth/node-sdk';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  hello: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const idToken = req.headers.authorization?.split(' ')[1] || '';

  try {
    const web3auth = new Web3Auth({
      clientId, // Get your Client ID from Web3Auth Dashboard
      chainConfig,
      web3AuthNetwork
    });

    web3auth.init();
    console.log("ID Token", idToken);

    const connect = async () => {
      const provider = await web3auth.connect({
        verifier: "axie-sniper-firebase-verifier", // replace with your verifier name
        verifierId: "sub", // replace with your verifier id, setup while creating the verifier on Web3Auth's Dashboard
        idToken, // replace with your newly created unused JWT Token.
      });
      const ethPrivKey = await provider!.request({ method: "eth_private_key" });
      console.log("ETH Private Key", ethPrivKey);
    };
    await connect();
    res.status(200).json({ hello: 'there' })

  } catch (error) {
    console.log(error)
    res.status(500).json({ hello: 'error' })
  }

}
