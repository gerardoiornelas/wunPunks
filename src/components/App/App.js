import { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { ethers } from "ethers";
import Countdown from "react-countdown";

// Components
import { Navigation } from "../Navigation";
import { Loading } from "../Loading";
import { RowCol, Row, Col } from "../RowCol";
import { Mint } from "../Mint";

// ABIs: Import your contract ABIs here
import NFT_ABI from "../../abis/NFT.json";

// Config: Import your network config here
import config from "../../config.json";

import ImgPreview from "../../images/preview.png";

function App() {
  const [provider, setProvider] = useState(null);
  const [nft, setNFT] = useState(null);
  const [account, setAccount] = useState(null);
  const [revealTime, setRevealTime] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [cost, setCost] = useState(0);
  const [balance, setBalance] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    // Initiate contract
    const nft = new ethers.Contract(
      config[31337].nft.address,
      NFT_ABI,
      provider
    );
    setNFT(nft);

    // Fetch accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    // Get coundown
    const allowMintingOn = await nft.allowMintingOn();
    setRevealTime(`${allowMintingOn.toString()}000`);

    // Fetch NFT Max Supply
    setMaxSupply(await nft.maxSupply());

    // Fetch Total Supply
    setTotalSupply(await nft.totalSupply());

    // Fetch Cost
    setCost(await nft.cost());

    // Fetch Balance
    setBalance(await nft.balanceOf(account));

    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    <Box>
      <Navigation account={account} />

      {isLoading ? (
        <Loading />
      ) : (
        <Container>
          <RowCol p={3}>
            <RowCol mb={3}>
              <Typography variant="h3" align="center">
                Wun Punks
              </Typography>
            </RowCol>
            <Row>
              <Col xs={12} md={6}>
                {balance > 0 ? (
                  <Box
                    component="img"
                    src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${balance.toString()}.png`}
                    alt="Open punk"
                  />
                ) : (
                  <Box component="img" src={ImgPreview} alt="preview" />
                )}
              </Col>
              <Col xs={12} md={6}>
                <RowCol mb={3}>
                  <Typography variant="h4">
                    <Countdown date={parseInt(revealTime)} />
                  </Typography>
                </RowCol>
                <RowCol>
                  <Typography>{`Available to Mint: ${
                    maxSupply - totalSupply
                  }`}</Typography>
                </RowCol>
                <RowCol>
                  <Typography>{`Cost to Mint: ${ethers.utils.formatUnits(
                    cost,
                    "ether"
                  )} ETH`}</Typography>
                </RowCol>
                <RowCol mb={3}>
                  <Typography>{`You own: ${balance.toString()}`}</Typography>
                </RowCol>
                <RowCol>
                  <Mint
                    provider={provider}
                    nft={nft}
                    cost={cost}
                    setIsLoading={setIsLoading}
                  />
                </RowCol>
              </Col>
            </Row>
          </RowCol>
        </Container>
      )}
    </Box>
  );
}

export default App;
