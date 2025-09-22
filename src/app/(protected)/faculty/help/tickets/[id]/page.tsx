"use client"
import TicketDetail from "@/components/help/ticket-detail";
import { useParams } from "next/navigation";


export default function Page() {
      const params = useParams();
      const id = params?.id as string;
  return (
    <>
      <TicketDetail ticketId={id} />
    </>
  );
}
