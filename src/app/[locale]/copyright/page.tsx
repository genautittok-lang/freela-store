import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("copyright");
export const generateMetadata = page.generateMetadata;
export default page.Page;
