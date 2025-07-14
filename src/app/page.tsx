import Image from "next/image";

export default function Home() {
  return (
<main className="flex flex-wrap justify-center w-full h-fit text-center items-center bg-amber-100">
  <div className="w-full h-full md:w-1/2 p-3 flex flex-col items-center">
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={150}
      height={150}
      className="border-s-2 rounded-full mb-4 "
    />
    <h1 className="text-3xl font-bold text-amber-950 mb-2">
      Hi 👋, I'm Alfar Abusalihu
    </h1>
        <p className="text-lg max-w-xl text-gray-700 mb-6">
          A tech enthusiast passionate about rapidly evolving technologies. As a quick learner, I easily adapt to
          different tech stacks and tools. My goal is to contribute to my workplace's continuous growth while
          enhancing my skills and experience to the next level
        </p>

        <div className="flex p-2">
          <p className="mx-2 space-y-2 items-center flex">
            <a href="mailto:alfarabusalihu@gmail.com" className="hover:underline block"><Image src="/gmail.jpg" className="rounded-2xl border-b-black" alt="logo" width={40} height={40}></Image></a><br />
          </p>
          <p className=" mx-2 space-y-2 items-center flex">
            <a href="https://linkedin.com/in/your-profile" target="_blank" className="hover:underline block"><Image src="/linkedin.png" className="rounded-2xl border-b-black" alt="logo" width={40} height={40}></Image></a><br />
          </p>
          <p className=" mx-2 space-y-2 items-center flex">
            <a href="https://github.com/alfarabusalihu" target="_blank" className="hover:underline block"><Image src="/github.webp" className="rounded-2xl border-b-black" alt="logo" width={40} height={40}></Image></a><br />
          </p>
        </div>
  </div>

  <div className="w-full md:w-1/2 flex flex-col items-center">
    <h2 className="text-2xl font-semibold text-gray-800 mb-8">Stacks</h2>
    <div className="flex border-amber-950 bg-amber-200 rounded-2xl p-4 ">
    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 ">
      {[
        "HTML", "CSS", "SCSS", "Tailwind CSS", "Javascript", "Typescript", "Next JS", "Angular Js", "React",
        "Node Js", "Nest JS", "Go", "PHP", "Docker", "Git", "Bootstrap", "Ant Design", "Figma", 
      ].map((tech) => (
        <li key={tech} className="bg-amber-950 text-white rounded-2xl px-5 py-3 font-semibold">
          {tech}
        </li>
      ))}
    </ul>
    </div>
  </div>
</main>
  );
}