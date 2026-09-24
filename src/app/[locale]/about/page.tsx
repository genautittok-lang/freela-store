import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("about");
export const generateMetadata = page.generateMetadata;
export default page.Page;
