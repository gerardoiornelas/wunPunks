import { useState } from "react";
import { Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";

function Mint({ provider, nft, cost, setIsLoading }) {
  const [isWaiting, setIsWaiting] = useState(false);
  const mintHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    console.log("minting...");
    try {
      const signer = await provider.getSigner();
      const transaction = await nft.connect(signer).mint(1, { value: cost });
      await transaction.wait();
    } catch {
      window.alert("User rejected or transaction reverted");
    }
    setIsLoading(true);
  };

  return (
    <Box component="form" onSubmit={mintHandler}>
      <LoadingButton
        size="large"
        loading={isWaiting}
        variant="contained"
        type="submit"
      >
        Mint
      </LoadingButton>
    </Box>
  );
}

export default Mint;
