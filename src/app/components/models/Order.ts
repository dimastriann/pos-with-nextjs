import { PosModelProps, PosBase } from "@/app/components/models/Base";


interface Order {
    id: number | undefined;
    uid: string;
    name: string;
    // addProduct: (product: object) => void;
    // addOrderLine: (line: object) => void;
}

type JsonOptions = {
    id: number
    name: string
}

type OrderOptions = {
    json: JsonOptions
}


class PosOrder extends PosBase {
    id: number | undefined;
    uid: string;
    name: string;

    constructor(defaultObj: PosModelProps, options: OrderOptions) {
        super({defaultObj, options})
        if(options.json){
            this.name = ""
            this.uid = ""
        } else {
            this.id = undefined
            this.name = ""
            this.uid = ""
        }
        // this = ""
    }
    

    addProduct(product: object){
        console.log("product", product)
    }

    addOrderLine(line: object){
        console.log("line", line)
    };
}

export default PosOrder;