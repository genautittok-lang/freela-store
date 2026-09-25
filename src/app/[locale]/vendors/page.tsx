import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("vendors");
export const generateMetadata = page.generateMetadata;
export default page.Page;
