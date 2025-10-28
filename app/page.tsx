import UploadBox from "../src/components/UploadBox";

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold text-white">Audiocut 🚀</h1>
    <UploadBox />
    </main>
  );
}
