import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("data-inventory");
export const generateMetadata = page.generateMetadata;
export default page.Page;
