"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const supabase_1 = require("./supabase");
const utils_1 = require("./utils");
const client = (0, redis_1.createClient)();
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();
const publisher = (0, redis_1.createClient)();
publisher.on("error", (err) => console.log("Redis Client Error", err));
publisher.connect();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Deploy service setting up...");
        console.log("Service set up!");
        while (1) {
            const response = yield client.brPop((0, redis_1.commandOptions)({ isolated: true }), "build-queue", 0);
            console.log(response);
            if (response === null) {
                throw new Error("Response is null");
            }
            const id = response.element;
            yield (0, supabase_1.downloadSupabaseDir)(`out/${id}`);
            console.log("Downloaded all files successfully");
            yield (0, utils_1.buildProject)(id);
            yield (0, supabase_1.storeDistDir)(id);
            yield publisher.hSet("status", id, "deployed");
        }
    });
}
main();
