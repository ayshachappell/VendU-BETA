import { isFounderEmail } from "@/lib/edu-verification.server";

process.env["FOUNDER_EMAILS_ADDITIONAL"] = "ayshac@integroservicegroup.com";
process.env["FOUNDER_EMAILS"] = "owner@example.com";

console.log("isFounderEmail(ayshac)=", isFounderEmail("ayshac@integroservicegroup.com"));
console.log("isFounderEmail(owner)=", isFounderEmail("owner@example.com"));
console.log("isFounderEmail(other)=", isFounderEmail("other@example.com"));
