import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("privacy");
export const generateMetadata = page.generateMetadata;
export default page.Page;
