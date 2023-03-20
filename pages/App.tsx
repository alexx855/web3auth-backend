import { WALLET_ADAPTERS } from "@web3auth/base";
import { useWeb3Auth } from "@/services/web3auth";
import { signInWithGoogle } from "@/services/firebaseAuth";
import { getPublicCompressed } from "@toruslabs/eccrypto";
import styles from "@/styles/Home.module.css";

function App() {
 const { provider, login, logout, getUserInfo, getAccounts, getBalance, signMessage, isLoading, signTransaction, signAndSendTransaction, web3Auth,  setIsLoading } = useWeb3Auth();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const loginRes = await signInWithGoogle();
      console.log("login details", loginRes);
      const idToken = await loginRes.user.getIdToken(true);
      console.log("idToken", idToken);
      await login(WALLET_ADAPTERS.OPENLOGIN,"jwt", idToken)
    } finally {
      setIsLoading(false);
    }
  }

  const validateIdToken = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const { idToken } = await web3Auth.authenticateUser();
    // console.log(idToken);

    const privKey: any = await web3Auth.provider?.request({
      method: "eth_private_key",
    });
    // console.log(privKey);
    const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString(
      "hex"
    );

    // Validate idToken with server
    const res = await fetch("/api/hello", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ appPubKey: pubkey }),
    });
    if (res.status === 200) {
      alert("JWT Verification Success");
    } else {
      alert("JWT Verification Failed");
    }
    return res.status;
  };

  const loggedInView = (
    <>
      <button onClick={validateIdToken} className={styles.card}>
        Validate Id Token
      </button>
      <button onClick={getUserInfo} className={styles.card}>
        Get User Info
      </button>
      <button onClick={getUserInfo} className={styles.card}>
        Get User Info
      </button>
      <button onClick={getAccounts} className={styles.card}>
        Get Accounts
      </button>
      <button onClick={getBalance} className={styles.card}>
        Get Balance
      </button>
      <button onClick={signMessage} className={styles.card}>
        Sign Message
      </button>

      {
        (web3Auth?.connectedAdapterName === WALLET_ADAPTERS.OPENLOGIN) &&
        (<button onClick={signTransaction} className={styles.card}>
          Sign Transaction
      </button>)
      }
      <button onClick={signAndSendTransaction} className={styles.card}>
        Sign and Send Transaction
      </button>
      <button onClick={logout} className={styles.card}>
        Log Out
      </button>

      <div className={styles.console} id="console">
        <p className={styles.code}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <div>
      <h3>Login With</h3>
      <button onClick={()=> handleGoogleLogin()} className={styles.card}>
        Google
      </button>
    </div>
  );

  return isLoading ?
    (
      <div>
        Loading
      </div>
    ): (
      <div className={styles.grid}>{provider ? loggedInView : unloggedInView}</div>
    )
}

export default App;