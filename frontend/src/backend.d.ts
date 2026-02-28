import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WingoGameResult {
    winningNumber: bigint;
    colorResult: Variant_red_green_violet;
}
export type WingoBetType = {
    __kind__: "color";
    color: {
        color: Variant_red_green;
    };
} | {
    __kind__: "numberValue";
    numberValue: {
        value: bigint;
    };
} | {
    __kind__: "violet";
    violet: null;
};
export interface WingoBet {
    player: Principal;
    roundResult?: WingoGameResult;
    betType: WingoBetType;
    roundId: bigint;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export interface WingoRound {
    id: bigint;
    startTime: bigint;
    winningNumber?: bigint;
    endTime: bigint;
    colorResult?: Variant_red_green_violet;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_red_green {
    red = "red",
    green = "green"
}
export enum Variant_red_green_violet {
    red = "red",
    green = "green",
    violet = "violet"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBetHistory(limit: bigint): Promise<Array<WingoBet>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentRound(): Promise<WingoRound>;
    getRoundHistory(limit: bigint): Promise<Array<WingoRound>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeBet(roundId: bigint, betType: WingoBetType, amount: bigint): Promise<void>;
    resolveRound(roundId: bigint, winningNumber: bigint, colorResult: Variant_red_green_violet): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
