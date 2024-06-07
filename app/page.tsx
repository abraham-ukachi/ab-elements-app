import Image from "next/image";
import Link from "next/link";





export default function Home() {
  return (
    <main className="flex flex-col relative w-full h-dvh items-center justify-center box-border p-6 select-none">

      {/* Container */}
      <div className="Container relative flex flex-col size-full grow overflow-auto items-left lg:items-center justify-center rounded-lg lg:rounded-xl lg:bg-white/40 lg:dark:bg-black/10 p-0 lg:p-24">
        
        <Link
          className="flex w-fit hover:no-underline"
          href="https://github.com/abraham-ukachi/ab-elements-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Ab Elements - SVG */}
          <Image
            src="/ab-elements.svg"
            alt="AB Elements"
            className="dark:invert w-[110px] h-[24px] lg:w-[220px] lg:h-[48px]"
            width={439}
            height={96}
            priority
          />

        </Link>


        {/* Coming Soon - Title */}
        <h1 className="text-4xl text-[#8B5000] dark:text-[#FFB86B] font-bold my-2 animate-pulse hover:animate-none lg:text-7xl lg:uppercase lg:my-4">Coming Soon</h1>
        
        {/* Description */}
        <p className="text-base lg:text-xl lg:max-w-xl lg:text-center">
          <span>A lightweight library of <strong>100%</strong> free server + client/UI elements for your 
          `<Link 
            href="https://nextjs.org/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#8B5000] dark:hover:text-[#FFB86B] hover:underline decoration-dashed underline-offset-4">
            Next.js
          </Link>`,

          `<Link 
            href="https://react.dev/learn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#8B5000] dark:hover:text-[#FFB86B] hover:underline decoration-dashed underline-offset-4">
            React
          </Link>`,

          `<Link 
            href="https://vuejs.org/guide/introduction.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#8B5000] dark:hover:text-[#FFB86B] hover:underline decoration-dashed underline-offset-4">
            Vue
          </Link>`,

          `<Link 
            href="https://lit.dev/docs/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#8B5000] dark:hover:text-[#FFB86B] hover:underline decoration-dashed underline-offset-4">
            Lit
          </Link>`,
          and 

          `<Link 
            href="https://docs.flutter.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#8B5000] dark:hover:text-[#FFB86B] hover:underline decoration-dashed underline-offset-4">
            Flutter
          </Link>`

          projects,</span>

          <span> created with ❤️ by </span>
          <span>
            <Link 
              href="https://github.com/abraham-ukachi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group/author font-medium text-[#8B5000]/80 hover:text-[#8B5000] dark:hover:text-[#FFB86B] hover:underline decoration-dashed underline-offset-4 relative">

              {'Abraham Ukachi'}

              <Image 
                src="/me.jpg"
                alt="Abraham UKachi"
                className="group-hover/author:block hidden absolute -right-6 top-1 lg:-right-9 lg:top-0 rounded-full outline outline-4 outline-[#8B5000] animate-spin size-4 lg:size-6"
                width={24}
                height={24}
                priority
              />

            </Link>
            {'.'}
          </span>
        </p>
        


        {/* Footer */}
        <footer className="absolute bottom-0 place-self-center flex flex-col items-center justify-center w-full h-auto">
          {/* Github - Link */}
          <Link 
            href="https://github.com/abraham-ukachi/ab-elements-app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="my-4 opacity-20 transition-opacity hover:opacity-80 dark:invert animate-bounce hover:animate-none">

            <Image 
              src="/github-logo.svg"
              alt="Github Logo"
              className="size-8 lg:size-12"
              width={48}
              height={48}
              priority
            />

          </Link>


        </footer>
           

        <div className="absolute place-self-center z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-amber-200 after:via-yellow-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-yellow-700 before:dark:opacity-10 after:dark:from-amber-900 after:dark:via-[#FFB86B] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px] -mt-24 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]">
        </div>

      </div>
      {/* End of Container */}


      {/* Copyright */}
      <p className="text-xs lg:text-sm opacity-50 mt-2 lg:mt-4">© {new Date().getFullYear()} abElements. All rights reserved.</p>




    </main>
  );
}
