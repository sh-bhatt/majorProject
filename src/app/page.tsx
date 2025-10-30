import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"


export default function Home() {

  return (
    <div className=" h-screen bg-center"
      style={{ backgroundImage: "url(/images/bg.png)" }}>
      <header className={` flex justify-end p-4`}>
        
      </header>
      <div >
        <h1 className={` text-9xl text-center ml-6 mr-6`}> The Interviewer </h1>
        <p className={` ml-160 text-xl `}>
          Meet The Interviewer Who Knows Your Resume Better Than You Do.
        </p>

      </div>
      <div className={` mt-20 text-l text-center leading-8 tracking-wide `}>
        <p>
          <b>The Interviewer</b> lets you step into the future of interview practice  a hyper-realistic mock interview that pushes you <br />to your limits. <br />
          By the time you walk into that actual interview, you won’t just feel ready  you’ll feel unstoppable.


        </p>

      </div>
      <div className={` flex flex-col items-center mt-40 space-y-4`}>
        <p>Upload your resume and watch the magic happen.</p>
        <Link href={"/resume"}>
          <Button className="px-10 py-6 text-xl">Get Started</Button>
        </Link>
      </div>

    </div>
  )
}