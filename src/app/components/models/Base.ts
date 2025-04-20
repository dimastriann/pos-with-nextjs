let nextId = 0;

export interface PosModelProps {
    id?: string | number;
    cid?: string;
    [key: string]: any; // Allows other arbitrary properties
}

export class PosBase {
    cid: string | undefined;
    [key: string]: any;

    /**
     * Create an object with cid. If no cid is in the defaultObj,
     * cid is computed based on its id. Override _getCID if you
     * don't want this default calculation of cid.
     * @param defaultObj Optional object whose props are copied to this instance.
     */
    constructor(defaultObj?: PosModelProps) {
        this.setup(defaultObj);
    }

    // To be used by Model patches to patch constructor
    setup(defaultObj?: PosModelProps): void {
        defaultObj = defaultObj || {};
        if (!defaultObj.cid) {
            defaultObj.cid = this._getCID(defaultObj);
        }
        Object.assign(this, defaultObj);
    }

    /**
     * Default cid getter. Used as local identity of this object.
     * @param obj Object from which to compute cid.
     */
    protected _getCID(obj: PosModelProps): string {
        if (obj.id !== undefined) {
            if (typeof obj.id === "string") {
                return obj.id;
            } else if (typeof obj.id === "number") {
                return `c${obj.id}`;
            }
        }
        return `c${nextId++}`;
    }
}
