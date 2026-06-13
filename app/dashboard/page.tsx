import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signIn");

  const initial = session.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium text-gray-900">
            Hola, {session.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Esto es lo que está pasando hoy.</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1.5">Proveedor</p>
            <p className="text-base font-medium text-gray-900 capitalize">
              {session.user?.email?.includes("gmail") ? "Google" : "GitHub"}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1.5">Email</p>
            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.email}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1.5">Estado</p>
            <p className="text-sm font-medium text-green-600">Activo</p>
          </div>
        </div>

        {/* User card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Avatar"
              width={52}
              height={52}
              className="rounded-full"
            />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-black flex items-center justify-center text-white text-lg font-medium flex-shrink-0">
              {initial}
            </div>
          )}
          <div>
            <p className="text-base font-medium text-gray-900">{session.user?.name}</p>
            <p className="text-sm text-gray-500">{session.user?.email}</p>
          </div>
          <div className="ml-auto">
            <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
              Verificado
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}