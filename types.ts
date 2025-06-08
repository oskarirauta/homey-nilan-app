export namespace Register {

  export enum Type { Holding, Input, Coil, Discrete }

  export interface Query {
    addr: number;
    type: Type;
    description: string;
    scale?: number;
    min?: number;
    max?: number;
    modifier_read?: (value: number) => number;
    modifier_write?: (value: number) => number;
  }

  export type Queries = Map<string, Query>;
  export type Results = Map<string, number>;

  export const filter = ((m: Queries, keys: Array<string>): Queries => {
    const res: Queries = new Map();
    keys.forEach((element) => {
      const value = m.get(element);
      if ( value !== undefined )
        res.set(element, value);
    });
    return res;
  });
}

export enum ValueType { Number, State, Parser };

export interface CapacityMapping {
  name: string | Array<string>;
  type: ValueType;
  factor?: number;
  min?: number;
  max?: number;
  update?: string;
};

export interface UpdateMapping {
  id: string,
  description: string,
  queries: Register.Queries,
  factor?: number,
  capability?: string,
  timeout?: NodeJS.Timeout;
};

export type CapacityMap = Map<string, CapacityMapping>;
export type UpdateMap = Map<string, UpdateMapping>;

export interface Fetch {
  queries: Register.Queries;
  condition: (now: number, last?: number) => Boolean;
  timeout: number;
  last?: number;
};

export const limitValueRange = ((value: number, min?: number, max?: number): number => {
  return min !== undefined && value < min! ? min! : ( max !== undefined && value > max! ? max! : value );
});
