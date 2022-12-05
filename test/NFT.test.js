const { expect } = require("chai");
const { ethers } = require("hardhat");

const nfts = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = nfts;

describe("NFT", () => {
  const NAME = "WUN Punks";
  const SYMBOL = "WP";
  const COST = ether(10);
  const MAX_SUPPLY = 25;
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";
  let nft, deployer, minter;

  beforeEach(async () => {
    let accounts = await ethers.getSigners();
    deployer = accounts[0];
    minter = accounts[1];
  });

  describe("Deployment", () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10); // two minutes from now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory("NFT");
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        ALLOW_MINTING_ON,
        BASE_URI
      );
    });

    it("has correct name", async () => {
      expect(await nft.name()).to.equal(NAME);
    });

    it("has correct symbol", async () => {
      expect(await nft.symbol()).to.equal(SYMBOL);
    });

    it("returns cost to mint", async () => {
      expect(await nft.cost()).to.equal(COST);
    });

    it("returns NFT max supply", async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("returns minting time allowed", async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON);
    });

    it("returns base uri", async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI);
    });

    it("returns the owner", async () => {
      expect(await nft.owner()).to.equal(deployer.address);
    });
  });
});
