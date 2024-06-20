import { getActiveListing } from "./utils/magicedit/magiceden";

async function main(){
  const list = await getActiveListing();
  console.log(list)
}