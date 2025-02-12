"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "~~/hooks/useAccount";
import {
  useReadContract,
  useSendTransaction,
  useContract,
} from "@starknet-react/core";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { AskCat } from "~~/components/AskCat";
import { Loading } from "~~/components/Loading";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "~~/hooks/use-toast";
import dynamic from "next/dynamic";
import { romanToNumberMap, decodeByteArray } from "~~/utils/helpers";
import { useRouter } from "next/navigation";
import { ABI } from "./abis/abi";
import { nftType } from "./abis/nft_type";
import type { Abi } from "starknet";
import { abi } from "./debug/_components/contract/__test__/mock/mockABI";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NextPage } from "next";
import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

const FireLeft = dynamic(() => import("~~/components/FireLeft"), {
  ssr: false,
});
const FireRight = dynamic(() => import("~~/components/FireRight"), {
  ssr: false,
});

const Home: NextPage = () => {
  const { isConnected: connected, address: connectedAddress } = useAccount();
  const { toast } = useToast();
  const router = useRouter();
  const [bgLoading, setBgLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showRevealBtn, setShowRevealBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCardList, setShowCardList] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  const [choseCard, setChoseCard] = useState<string>();
  const [choseContent, setChoseContent] = useState<string>();
  const [cardName, setCardName] = useState<string>();
  const [choseCardVisible, setChoseCardVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState<string>();
  const [clickedCard, setClickedCard] = useState(true);
  const [showFinalCard, setShowFinalCard] = useState(false);
  const [showFinalContent, setShowFinalContent] = useState(false);
  const [currentPage, setCurrentPage] = useState("Home");
  const [mintSuccess, setMintSuccess] = useState(false);
  const [nftData, setNftData] = useState({});
  const [uploadedItem, setUploadedItem] = useState<any>();

  const { sendAsync: mintItem } = useScaffoldWriteContract({
    contractName: "Tarot",
    functionName: "mint",
    args: [connectedAddress, ""],
  });

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "Tarot",
  });

  const { data: drawCardByteArray, refetch: drawCardRefresh } =
    useScaffoldReadContract({
      contractName: "Tarot",
      functionName: "draw_card",
      args: [],
      enabled: !!inputValue,
    });

  const { data: drawCardData2, refetch: drawCardRefresh2 } = useReadContract({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "draw_card",
    abi: ABI,
    args: [],
    enabled: !!inputValue,
  });

  useEffect(() => {
    // preload bg
    if (typeof window !== "undefined") {
      const img = new window.Image();
      img.src = "/images/bg.webp";
      img.onload = () => {
        setBgLoading(false);
      };
    }
    // setInnerWidth(window.innerWidth);
    // setInnerHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (connected) {
      setShowTips(false);
    } else {
      initStatus();
      setShowTips(true);
    }
  }, [connected]);

  const handleReadyClick = () => {
    if (!connected) {
      setShowTips(true);
    } else {
      setShowTable(true);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.trim() !== "") {
      setShowRevealBtn(true);
    } else {
      setShowRevealBtn(false);
    }
    setInputValue(event.target.value);
  };

  const handleRevealClick = async () => {
    if (inputValue.trim() === "") {
      toast({
        title: "Warning",
        description: "Please enter your question first~",
      });
    } else {
      setLoading(true);
      try {
        await drawCardRefresh();

        console.log("drawcard", drawCardByteArray);

        if (drawCardByteArray) {
          const drawCardData = drawCardByteArray as unknown as string;
          const romanNumber = drawCardData.split(" ")[0];
          const cardNumber = romanToNumberMap.get(romanNumber);
          const card = drawCardData.split(",")[0];
          const position =
            drawCardData.split(",")[1] === "" ? "reverse" : "upright";
          const gptResponse = await fetch(
            "https://art3misoracle.jeffier2015.workers.dev",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ description: inputValue, card, position }),
            }
          );
          if (!gptResponse.ok) {
            throw new Error("Failed to fetch gpt source");
          }

          const gptData = await gptResponse.json();
          console.log("GPT Response:", gptData);
          setCardPosition(position);
          setCardName(card);
          const cardUrl = `/cards/${cardNumber}.png`;
          let nftData = nftType;
          nftData.name = drawCardData;
          nftData.image = `https://ipfs.io/ipfs/bafybeiel3ftyc3pkjfnb5dseioeuoewr5xqqpxqyb2737e4shfkvnbrkuy/${cardNumber}.png`;
          nftData.attributes[0].value = inputValue;
          nftData.attributes[1].value = gptData.choices[0].message.content;
          nftData.attributes[2].value = new Date().getTime().toString();
          setNftData(nftData);
          setChoseCard(cardUrl);
          setChoseContent(gptData.choices[0].message.content);
          setShowCardList(true);
          setShowTable(false);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCardClick = (index: number, event: React.MouseEvent) => {
    if (clickedIndex !== null) return;
    const rect = (
      event.currentTarget as HTMLDivElement
    ).getBoundingClientRect();
    console.log("rect", rect);

    setCenterPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    console.log("rect", rect.left + rect.width / 2);
    console.log("rect", rect.top + rect.height / 2);
    setClickedIndex(index);
    // update: show card instantly
    setClickedCard(false);
    setChoseCardVisible(true);
  };

  const handleChoseCardClick = () => {
    setClickedCard(false);
    setTimeout(() => {
      setChoseCardVisible(true);
    }, 600);
  };

  const handleChoseCardVisibleClick = () => {
    setChoseCardVisible(false);
    setShowFinalCard(true);
    setTimeout(() => {
      setShowFinalContent(true);
    }, 1200);
  };

  const handleRestartClick = () => {
    initStatus();
  };

  function initStatus() {
    setShowTips(false);
    setShowTable(false);
    setShowCardList(false);
    setShowFinalCard(false);
    setShowFinalContent(false);
    setChoseCardVisible(false);
    setShowRevealBtn(false);
    setClickedIndex(null);
    setCenterPos({ x: 0, y: 0 });
    setChoseCardVisible(false);
    setClickedCard(true);
  }

  // const {
  //   isError,
  //   error,
  //   sendAsync: mint,
  //   data,
  //   isSuccess: isMintSuccess,
  //   isPending,
  // } = useSendTransaction({
  //   calls:
  //     contract && connectedAddress
  //       ? [contract.populate("mint", [uploadedItem])]
  //       : undefined,
  // });

  const handleMintClick = async () => {
    try {
      setLoading(true);
      const uploadedItem: any = await addToIPFS(nftData);
      const res = await mintItem({
        args: [connectedAddress, uploadedItem.path],
      });
      // setUploadedItem(uploadedItem.path);
      // await mint();
      console.log("mint", res, nftData);
      // if (isMintSuccess) {
      //   toast({
      //     description: "Mint Card Success~",
      //     className: "bg-[#573019] text-white",
      //   });
      //   setTimeout(() => {
      //     setMintSuccess(true);
      //   }, 2000);
      // }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error, please try it later~",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    const tweetText =
      encodeURIComponent(`✨ Unveil the Mysteries of the Blockchain with Art3misSTRK! ✨

I've discovered the most magical Web3 tarot card project—Art3misSTRK. 
`);

    const twitterShareUrl = `https://x.com/intent/post?text=${tweetText}`;

    console.log(twitterShareUrl);

    window.open(twitterShareUrl, "_blank", "noopener,noreferrer");
  };

  const goProfile = () => {
    if (!connected) {
      toast({
        title: "Warning",
        description: "Please enter your question first~",
      });
      return;
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      {bgLoading ? (
        <div className="w-full h-screen bg-black animate-pulse">
          <Loading />
        </div>
      ) : (
        <div className="relative w-full h-screen flex flex-col">
          {loading && <Loading />}
          {(showTable || showCardList) && (
            <div className="fixed inset-0 bg-black opacity-60 z-10" />
          )}
          <div className="relative w-full h-screen flex flex-col">
            {/* Background Image */}

            <Image
              src="/images/bg_mobile.png"
              alt="background"
              fill
              className="md:hidden absolute top-0 left-0 w-full h-full object-cover"
            />

            <Image
              src="/images/bg.webp"
              alt="background"
              fill
              className="hidden md:block absolute top-0 left-0 w-full h-full md:object-fill "
            />
            {/* fire animation */}

            <FireLeft />

            <FireRight />

            {/* wallet */}
            <div
              className="absolute z-30"
              style={{
                right: "calc(40 / 1920 * 100%)",
                top: "calc(40 /1080 * 100%)",
                height: "auto",
              }}
            >
              <div className="flex flex-row items-center gap-2">
                <CustomConnectButton />
                <button
                  onClick={goProfile}
                  className="btn hidden md:block md:leading-7 lg:leading-7 bg-transparent btn-sm px-6 py-[0.35rem] dropdown-toggle gap-0 !h-auto border border-[#5c4fe5] "
                >
                  Profile
                </button>
              </div>
            </div>

            {/* ask */}

            <div className="flex flex-col items-center justify-center gap-6 px-2">
              {!showTips && !showTable && !showCardList && (
                <div
                  className="absolute flex md:flex-row justify-center items-center z-10 w-full md:w-auto 
                               md:left-[20%] top-[30%] md:top-[80%] transform -translate-y-1/2 "
                >
                  {/* AskCat container - Responsive sizing */}
                  <div className="w-[120px] hidden md:block md:w-[140px] lg:w-[220px] aspect-[120/160]">
                    <AskCat />
                  </div>

                  {/* Text and button container */}
                  <div className="flex flex-col gap-4 justify-center items-center mt-4 md:mt-0">
                    {/* Text box - Responsive width and font size */}
                    <div className="w-full max-w-[300px] md:hidden md:max-w-[846px] px-3">
                      <div
                        className="font-irishGrover py-2 w-full border bg-opacity-0 bg-black backdrop-blur-sm 
                                    border-[#C77F7F]  md:whitespace-nowrap text-wrap  rounded-md text-[#f5be66] text-[1rem] blur-[0.6px] px-4 shadow-[0_0_8px_#f5be66]"
                      >
                        Welcome, seeker of truth. The cards await your fate.
                        Shall we begin?
                      </div>
                    </div>

                    {/* mobile  */}

                    <div
                      className="relative hidden md:flex text-[#f5be66] text-[0.68rem] sm:text-[0.5rem] md:text-[0.75rem] lg:text-[1.1rem] font-bold [text-shadow:1px_1px_5px_black] blur-[0.4px] md:blur-[0.8px] px-4 py-2 rounded-2xl border border-[#C77F7F] shadow-[0_0_8px_#f5be66] items-center justify-center"
                      style={{
                        width: "clamp(180px, calc(846 / 1920 * 100vw), 846px)",
                        aspectRatio: "423/44",
                      }}
                    >
                      Welcome, seeker of truth. The cards await your fate. Shall
                      we begin?
                    </div>

                    {/* Ready button - Responsive sizing */}
                    <div
                      onClick={handleReadyClick}
                      className="w-[150px] md:w-[220px] aspect-[150/50] md:aspect-[110/30] cursor-pointer 
                                  transition-all duration-300 hover:brightness-125"
                    >
                      <Image
                        src="/images/btn_ready.webp"
                        alt="Ready"
                        width={110}
                        height={30}
                        sizes="(max-width: 768px) 120px, 220px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}
              {showTips && (
                <div
                  className="absolute md:mt-0 flex flex-row justify-center items-center w-full md:w-auto 
                            md:left-[25%] top-[80%] transform -translate-y-1/2 p-2 z-10"
                >
                  <div
                    className="relative"
                    style={{
                      width: "clamp(120px, calc(240 / 1920 * 100vw), 240px)",
                      aspectRatio: "120/160",
                    }}
                  >
                    <AskCat />
                  </div>
                  <div
                    className="hidden md:block relative  ml-[-16px] mb-16"
                    style={{
                      width: "clamp(290px, calc(580 / 1920 * 100vw), 580px)",
                      aspectRatio: "290/55",
                    }}
                  >
                    <Image
                      src="/images/ask_tips.webp"
                      alt="Ask"
                      width={290}
                      height={55}
                      sizes="290px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <div
                    className="md:hidden  w-[200px] h-20  mb-16 "
                    style={{
                      aspectRatio: "290/55",
                    }}
                  >
                    <Image
                      src="/images/ask_tips_mobile.png"
                      alt="Ask"
                      width={290}
                      height={55}
                      sizes="290px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                </div>
              )}
              {showTable && (
                <motion.div
                  className="fixed inset-0 flex justify-center items-center z-10 px-4"
                  style={{
                    // left: "calc(516 / 1920 * 100%)",
                    // top: "calc(234 /1080 * 100%)",
                    height: "auto",
                  }}
                  initial={{ y: "100vh" }}
                  animate={{ y: 0 }}
                  exit={{
                    opacity: 0.5,
                    transition: {
                      duration: 1,
                      opacity: { duration: 1 },
                    },
                  }}
                  transition={{
                    type: "spring",
                    mass: 14,
                    damping: 48,
                    stiffness: 320,
                  }}
                >
                  <div
                    className="relative w-full max-w-[490px] p-4 bg-[url('/images/ask_table.webp')] bg-no-repeat bg-center bg-cover rounded-md"
                    style={{
                      aspectRatio: "490/423",
                    }}
                  >
                    <button
                      className="absolute top-[-5%] right-0 m-4"
                      onClick={() => initStatus()}
                    >
                      <Image
                        src="/images/close.png"
                        alt="Close"
                        width={42}
                        height={42}
                        // className="w-6 h-6"
                      />
                    </button>
                    {/* <Image
                      src="/images/ask_table.webp"
                      alt="Ask"
                      width={490}
                      height={423}
                      sizes="490px"
                      className="w-full h-full"
                      priority
                    /> */}
                    {/* <textarea
                      onChange={handleInputChange}
                      style={{
                        top: "calc(120 / 1080 * 100vh)",
                        left: "calc(281 / 1920 * 100vw)",
                        width: "calc(373 / 1920 * 100vw)",
                        aspectRatio: "373/313",
                        resize: "none",
                      }}
                      className="absolute bg-transparent text-[#c9b69c] placeholder-[#c9b69c] overflow-auto outline-none z-10"
                      placeholder="Enter your question here..."
                    /> */}

                    <textarea
                      onChange={handleInputChange}
                      className="absolute top-10 md:top-14 left-[48%]  transform -translate-x-1/2 bg-transparent text-[#c9b69c] 
                   placeholder-[#c9b69c] m-auto ml-[-10] overflow-auto outline-none z-10 w-[40%] max-w-[373px] h-[110px]  md:h-[165px] 
                   resize-none "
                      placeholder="Enter your question here..."
                      style={{
                        aspectRatio: "373/313",
                        scrollbarWidth: "none",
                      }}
                    />
                    {showRevealBtn && (
                      <motion.div
                        className="absolute flex justify-center items-center z-10 top-2/3 transform -translate-x-1/2"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{
                          type: "spring",
                          mass: 14,
                          damping: 48,
                          stiffness: 200,
                        }}
                      >
                        <div
                          className="relative w-full"
                          style={{
                            width:
                              "clamp(120px, calc(240 / 1920 * 100vw), 240px)",
                            aspectRatio: "120/160",
                          }}
                        >
                          <AskCat />
                        </div>
                        <div
                          className="relative w-full ml-3 cursor-pointer transition-all duration-300 hover:brightness-125"
                          style={{
                            width:
                              "clamp(150px, calc(253 / 1920 * 100vw), 253px)",
                            aspectRatio: "253/86",
                          }}
                          onClick={handleRevealClick}
                        >
                          <Image
                            src="/images/btn_reveal.webp"
                            alt="Ask"
                            width={253}
                            height={86}
                            sizes="253px"
                            className="w-full h-full"
                            priority
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* the chose card */}
              {clickedIndex !== null && clickedCard && (
                <AnimatePresence>
                  <motion.div
                    className="absolute z-20 cursor-pointer"
                    onClick={handleChoseCardClick}
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{
                      scale: 1,
                      x: centerPos.x - window.innerWidth / 2,
                      y: centerPos.y - window.innerHeight / 2,
                    }}
                    animate={{
                      scale: 1.5,
                      x: "-50%",
                      y: "-50%",
                      transition: { duration: 2, ease: "easeInOut" },
                    }}
                    exit={{
                      opacity: 0.5,
                      x: 100,
                      y: "-50%",
                      transition: { duration: 1, ease: "easeInOut" },
                    }}
                  >
                    <div
                      className="absolute w-full"
                      style={{
                        width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                        aspectRatio: "93/139",
                      }}
                    >
                      <Image
                        src="/images/card.webp"
                        alt="Card"
                        width={93}
                        height={139}
                        sizes="93px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <motion.div
                      className="absolute w-full rounded-2xl z-20"
                      style={{
                        width: "clamp(94px, calc(187 / 1920 * 100vw), 187px)",
                        aspectRatio: "93/139",
                      }}
                      initial={{ boxShadow: "none" }}
                      animate={{
                        boxShadow: ["0 0 16px #FFB800", "0 0 3px #FFB800"],
                        transition: {
                          duration: 1,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                        },
                      }}
                      exit={{
                        boxShadow: "none",
                        transition: { duration: 0.3 },
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
              {choseCardVisible && (
                <motion.div
                  onClick={handleChoseCardVisibleClick}
                  className="absolute w-full z-20 cursor-pointer"
                  style={{
                    width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                    aspectRatio: "93/139",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%)`,
                    scale: 1.5,
                  }}
                  initial={{ opacity: 0, x: 80, y: "-50%" }}
                  animate={{
                    opacity: 1,
                    x: "-50%",
                    y: "-50%",
                    transition: { duration: 1 },
                  }}
                >
                  <div
                    className="absolute w-full"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      transform: `${cardPosition === "upright" ? "" : " rotate(180deg)"}`,
                    }}
                  >
                    <Image
                      src={choseCard || "/images/card.webp"}
                      alt="Card"
                      width={93}
                      height={139}
                      sizes="93px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <motion.div
                    className="absolute w-full rounded-[1.25rem] z-20"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      boxShadow: "0 0 16px #FFB800",
                    }}
                  />
                </motion.div>
              )}
              {showFinalCard && (
                <motion.div
                  className="absolute w-full z-20"
                  style={{
                    width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                    aspectRatio: "93/139",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)", // Default centering transform
                  }}
                  initial={{
                    opacity: 1,
                    x: "-50%",
                    y: "-50%",
                  }}
                  animate={{
                    opacity: 1,
                    left:
                      window.innerWidth < 768
                        ? `50%`
                        : `calc(1375.5 / 1920 * 100%)`,
                    top:
                      window.innerWidth < 768
                        ? `20%`
                        : `calc(482.5 / 1080 * 100%)`, // Mobile logic
                    transform:
                      window.innerWidth < 768
                        ? "translate(-50%, -50%) scale(1.36)" // Center horizontally and move up
                        : "translate(15%, 25%) scale(1.5)", // Keep original for larger screens
                    transition: { duration: 1.2, ease: "easeInOut" },
                  }}
                >
                  <div
                    className="absolute w-full"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      transform: `${cardPosition === "upright" ? "" : "rotate(180deg)"}`,
                    }}
                  >
                    <Image
                      src={choseCard || "/images/card.webp"}
                      alt="New Card"
                      width={93}
                      height={139}
                      sizes="93px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <motion.div
                    className="absolute w-full rounded-[1.25rem] z-20"
                    style={{
                      width: "clamp(92px, calc(186 / 1920 * 100vw), 185px)",
                      aspectRatio: "92/138",
                      boxShadow: "0 0 16px #FFB800",
                    }}
                  />
                </motion.div>
              )}
              {/* result desktop */}
              {showFinalContent && (
                <div className="absolute hidden md:flex flex-col gap-3 left-[calc(456/1920*100%)] top-[calc(463/1080*100%)]">
                  <div
                    className="absolute z-30 top-24 md:top-36 left-[calc(-280/860*100%)] md:left-[calc(-412/1920*100%)] w-[100px] h-[135px] md:h-[280px] md:w-[220px]"
                    style={{
                      // width: "clamp(135px, calc(270 / 1920 * 100vw), 270px)",
                      aspectRatio: "135/179",
                      // top: `calc(380 / 1080 * 100%)`,
                      // left: `calc(-412 / 1920 * 100%)`,
                    }}
                  >
                    <Image
                      src="/images/ask_cat2.webp"
                      alt="Ask"
                      width={135}
                      height={179}
                      sizes="135px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  {/* result desktop */}
                  <div
                    className="hidden md:block relative z-20 overflow-hidden aspect-[895/456]"
                    style={{
                      width: "clamp(447.5px, calc(895 / 1920 * 100vw), 895px)",
                    }}
                  >
                    <Image
                      src="/images/content_border.webp"
                      alt="Content"
                      width={895}
                      height={456}
                      sizes="895px"
                      className="w-full h-full"
                      priority
                    />
                    <div
                      style={{
                        top: "calc(56 /1080 * 100vh)",
                        left: "calc(77 / 1920 * 100vw)",
                        width: "calc(762 / 1920 * 100vw)",
                        resize: "none",
                      }}
                      className="absolute text-[#67cbfa] text-[1.2rem] sm:text-[0.5rem] md:text-[0.75rem] lg:text-[1.2rem] font-bold"
                    >
                      <div
                        className="overflow-auto"
                        style={{
                          height:
                            "clamp(182px, calc(356 / 1080 * 100vh), 356px)",
                        }}
                      >
                        {choseContent}
                      </div>
                    </div>
                  </div>
                  {/* result mobile */}
                  <div
                    className="md:hidden relative z-20 overflow-hidden aspect-[567/620]"
                    style={{
                      width: "clamp(260px, calc(260 / 860 * 100vw), 567px)",
                    }}
                  >
                    <Image
                      src="/images/content_border_mobile.png"
                      alt="Content"
                      width={567}
                      height={670}
                      sizes="567px"
                      className="w-full h-full"
                      priority
                    />
                    <div
                      style={{
                        top: "calc(24 /932 * 100%)",
                        left: "calc(24 / 430 * 100vw)",
                        resize: "none",
                      }}
                      className="absolute text-[#67cbfa] text-[0.75rem] sm:text-[0.75rem] md:text-[0.75rem] lg:text-[1.2rem] font-bold"
                    >
                      <div
                        className="overflow-auto"
                        style={{
                          width: "clamp(141px, calc(220 / 430 * 100vw), 220px)",
                          height:
                            "clamp(180px, calc(320 / 932 * 100vh), 320px)",
                        }}
                      >
                        {choseContent}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex justify-center gap-3 z-20">
                    <div
                      onClick={handleRestartClick}
                      className="relative w-full cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/restart_btn.webp"
                        alt="Restart"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <div
                      onClick={handleMintClick}
                      className="relative w-full cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/mint_btn.webp"
                        alt="Mint"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <div
                      onClick={handleShareClick}
                      className="relative w-full cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/share_btn.webp"
                        alt="Mint"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {showCardList && (
              <div className="absolute flex-wrap md:flex-nowrap md:left-1/2 md:translate-x-[-50%] top-1/2 md:top-[66%] translate-y-[-50%] flex justify-center gap-8 z-10">
                {Array.from({ length: 6 }).map((_, index) => (
                  <AnimatePresence key={index}>
                    {clickedIndex === null ? (
                      <motion.div
                        key={index}
                        className="relative w-full cursor-pointer"
                        style={{
                          width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                          aspectRatio: "93/139",
                        }}
                        onClick={(e) => handleCardClick(index, e)}
                        whileHover={{ translateY: "-32px" }}
                        transition={{ duration: 0.5 }}
                        initial={{ opacity: 1 }}
                        animate={
                          clickedIndex === null
                            ? { opacity: 1, y: 0 }
                            : clickedIndex === index
                              ? { opacity: 0 }
                              : {
                                  y: 100,
                                  opacity: 0,
                                  transition: { duration: 1 },
                                }
                        }
                        exit={{
                          y: "100vh",
                          opacity: 0,
                          transition: { duration: 1.5 },
                        }}
                      >
                        <div
                          className="absolute w-full"
                          style={{
                            width:
                              "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                            aspectRatio: "93/139",
                          }}
                        >
                          <Image
                            src="/images/card.webp"
                            alt="Card"
                            width={93}
                            height={139}
                            sizes="93px"
                            className="w-full h-full"
                            priority
                          />
                        </div>
                        <motion.div
                          className="absolute w-full rounded-2xl"
                          style={{
                            width:
                              "clamp(94px, calc(187 / 1920 * 100vw), 187px)",
                            aspectRatio: "93/139",
                          }}
                          whileHover={{
                            boxShadow: ["0 0 16px #FFB800", "0 0 3px #FFB800"],
                            transition: {
                              duration: 1,
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatType: "reverse",
                            },
                          }}
                          initial={{ boxShadow: "none" }}
                          animate={{
                            boxShadow: "none",
                            transition: { duration: 0.3 },
                          }}
                          exit={{
                            boxShadow: "none",
                            transition: { duration: 0.3 },
                          }}
                        ></motion.div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ))}
              </div>
            )}
            {/* result mobile */}
            {showFinalContent && (
              <div className="relative top-[36%] md:hidden gap-2 z-20">
                <div className="flex flex-col items-center">
                  <div
                    onClick={handleMintClick}
                    className="relative w-full cursor-pointer transition-all duration-300 hover:brightness-125 mb-4"
                    style={{
                      width: "clamp(80px, calc(160 / 430 * 100vw), 160px)",
                      aspectRatio: "160/50",
                    }}
                  >
                    <Image
                      src="/images/mint_mobile.png"
                      alt="Mint"
                      width={160}
                      height={50}
                      sizes="160px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative z-20 w-full max-w-[350px] md:hidden">
                      <div
                        className="font-sans py-5 w-full border bg-[#ebe5c9]
                                      border-[#c77f7f]  md:whitespace-nowrap text-wrap  rounded-md text-[#C77F7F] text-[0.86rem] px-3 shadow-[0_0_8px_#f5be66]"
                      >
                        {choseContent}
                      </div>
                    </div>
                  </div>

                  <div className="relative top-5 flex justify-center gap-5 z-20">
                    <div
                      onClick={handleRestartClick}
                      className="relative w-full cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/start_again_mobile.png"
                        alt="Restart"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>

                    <div
                      onClick={handleShareClick}
                      className="relative w-full cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/share_mobile.png"
                        alt="Mint"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
                <div className="h-[7rem]"></div>
              </div>
            )}
          </div>

          {/* mobile tab bar - hidden on desktop view */}
          <div className="fixed md:hidden bottom-0 w-full flex flex-row justify-center content-center items-center z-20">
            {[
              { label: "Home", icon: "/icons/eye-icon.png" },
              { label: "Profile", icon: "/icons/tree-icon.png" },
            ].map((page, index) => (
              <div
                key={index}
                onClick={() => {
                  page.label === "Home"
                    ? setCurrentPage(page.label)
                    : goProfile();
                }}
                className={`px-3 md:px-5 py-1 flex flex-col justify-center bg-[#0F0E26] text-center 
                               items-center w-1/2 ${
                                 currentPage === page.label
                                   ? "bg-gradient-to-b from-[#7a5833] via-[#0F0E26] to-[#0F0E26] text-[#FFBB54] border-t-2 border-t-[#B47028]"
                                   : "text-gray-300"
                               }`}
              >
                <div className="w-8 h-8 md:w-10 md:h-10">
                  <Image
                    src={page.icon}
                    alt={page.label}
                    width={50}
                    height={20}
                    sizes="(max-width: 768px) 32px, 40px"
                    className="w-full h-full"
                    priority
                  />
                </div>
                <span className="text-sm md:text-base">{page.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
