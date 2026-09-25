import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("abuse");
export const generateMetadata = page.generateMetadata;
export default page.Page;
