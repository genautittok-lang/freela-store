import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("terms");
export const generateMetadata = page.generateMetadata;
export default page.Page;
