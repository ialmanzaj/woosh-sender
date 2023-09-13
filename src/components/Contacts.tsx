import { type Contact } from "@prisma/client";
import { useSession } from "next-auth/react";
// import Image from "next/image";
import EditIcon from "public/static/images/icons/EditIcon";
import UserPlaceholder from "public/static/images/icons/UserPlaceholder";
import { api } from "~/utils/api";

export const Contacts = () => {
  const { data: session } = useSession();
  const { data, isLoading } = api.contact.getContacts.useQuery(undefined, {
    enabled: session?.user !== undefined,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) return <div>No data</div>;

  const Contact = ({ name }: { name: string }) => {
    return (
      <div className="group flex cursor-pointer flex-col items-center gap-1">
        <div className="relative">
          <div className="absolute -right-2 top-0 h-6 w-6 rounded-full bg-brand-white opacity-0 shadow group-hover:opacity-100">
            <EditIcon />
          </div>
          <UserPlaceholder />
        </div>
        <span className="uppercase">{name}</span>
      </div>
    );
  };

  return (
    <div>
      <p className="mb-5 font-polysans text-lg">contacts ({data.length})</p>
      <div className="flex w-full justify-items-start gap-x-8 gap-y-8 overflow-scroll md:grid md:grid-cols-5 md:gap-x-0 md:overflow-hidden">
        {data.map((contact: Contact, index: number) => (
          <div className="shrink-0" key={index}>
            <Contact name={contact.name} />
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <span className="w-full opacity-60">
          You can create and save contacts when you send funds!
        </span>
      )}
    </div>
  );
};
export default Contacts;
