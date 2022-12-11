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

  describe("Minting", () => {
    let transaction, result;

    describe("Success", () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
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

        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();
      });

      it("updates the total supply", async () => {
        expect(await nft.totalSupply()).to.equal(1);
      });

      it("returns the address of the minter", async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address);
      });

      it("returns total number of tokens the minter owns", async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1);
      });

      it("returns IPFS URI", async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
      });

      it("emits Mint event", async () => {
        await expect(transaction)
          .to.emit(nft, "Mint")
          .withArgs(1, minter.address);
      });
    });

    describe("Failure", () => {
      it("rejects insufficient payment", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be
          .reverted;
      });
      it("requires at least one NFT to be minted", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.connect(minter).mint(0, { value: COST })).to.be
          .reverted;
      });
      it("prevent minting more tokens than max supply", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.connect(minter).mint(2, { value: COST })).to.be
          .reverted;
      });
      it("rejects minting before allowed time", async () => {
        const ALLOW_MINTING_ON = new Date("May 26, 2030 18:00:00")
          .getTime()
          .toString()
          .slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be
          .reverted;
      });
      it("requires at least one nft to be minted", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.connect(minter).mint(0, { value: COST })).to.be
          .reverted;
      });
      it("Prevent minting more tokens than max supply", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.connect(minter).mint(100, { value: COST })).to.be
          .reverted;
      });
      it("does not return URI's for invalid tokens", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        await expect(nft.tokenURI("99")).to.be.reverted;
      });
    });
  });

  describe("Displaying NFT", () => {
    let transaction, result;

    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
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

      transaction = await nft.connect(minter).mint(3, { value: ether(30) });
      result = await transaction.wait();
    });

    it("returns all the NFTs for a given owner", async () => {
      let tokenIds = await nft.walletOfOwner(minter.address);
      expect(tokenIds.length).to.equal(3);
      expect(tokenIds[0].toString()).to.equal("1");
      expect(tokenIds[1].toString()).to.equal("2");
      expect(tokenIds[2].toString()).to.equal("3");
    });
  });

  describe("Withdrawing", () => {
    describe("Success", () => {
      let transaction, result, balanceBefore;

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now

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

        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();
        balanceBefore = await ethers.provider.getBalance(deployer.address);
        transaction = await nft.connect(deployer).withdraw();
        result = await transaction.wait();
      });

      it("deducts contract balance", async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0);
      });

      it("sends funds to owner", async () => {
        expect(
          await ethers.provider.getBalance(deployer.address)
        ).to.be.greaterThan(balanceBefore);
      });

      it("emits a withdraw event", async () => {
        expect(transaction)
          .to.emit(nft, "Withdraw")
          .withArgs(COST, deployer.address);
      });
    });

    describe("Failure", () => {
      it("prevents non-owner from withdrawing", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        nft.connect(minter).mint(1, { value: COST });
        await expect(nft.connect(minter).withdraw()).to.be.reverted;
      });
    });
  });

  describe("Owner actions", () => {
    let transaction, result;

    beforeEach(async () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10); // Now
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

    describe("Success", () => {
      it("updates cost", async () => {
        transaction = await nft.connect(deployer).setCost(ether(20));
        result = await transaction.wait();

        expect(await nft.cost()).to.equal(ether(20));
      });
    });

    describe("Failure", () => {
      it("prevents non-owner from setting new cost", async () => {
        await expect(nft.connect(minter).setCost(ether(20))).to.be.reverted;
      });
    });
  });
});
