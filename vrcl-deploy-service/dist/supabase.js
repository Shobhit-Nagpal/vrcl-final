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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeDistDir = exports.downloadSupabaseDir = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
require("dotenv/config");
const PROJECT_URL = process.env["SUPABASE_PROJECT_URL"] || "";
const ANON_KEY = process.env["SUPABASE_ANON_KEY"] || "";
const supabase = (0, supabase_js_1.createClient)(PROJECT_URL, ANON_KEY);
function downloadSupabaseDir(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: files, error } = yield supabase.storage
            .from("vercel")
            .list(dirPath);
        if (error) {
            console.error(`Error while listing ${dirPath} from Supabase: `, error);
            return;
        }
        const dirs = files.filter((file) => file.id === null);
        dirs.forEach((dir) => {
            const fullDirPath = path_1.default.join("dist", dirPath, dir.name);
            if (!fs_1.default.existsSync(fullDirPath)) {
                fs_1.default.mkdirSync(fullDirPath, { recursive: true });
            }
        });
        for (const file of files) {
            const filePath = path_1.default.join(dirPath, file.name);
            if (file.id === null) {
                yield downloadSupabaseDir(filePath);
            }
            else {
                yield downloadFile(filePath);
            }
        }
        console.log("Downloaded all files!");
    });
}
exports.downloadSupabaseDir = downloadSupabaseDir;
function downloadFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase.storage
            .from("vercel")
            .download(filePath);
        if (error) {
            console.error(`Error while downloading ${filePath} from Supabase: `, error);
            return;
        }
        const buffer = Buffer.from(yield data.arrayBuffer());
        const localFilePath = path_1.default.join(__dirname, `${filePath}`);
        fs_1.default.writeFileSync(localFilePath, buffer);
    });
}
function storeDistDir(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let finalDirPath = "";
        const dirPath = path_1.default.join(__dirname, `out/${id}/dist`);
        if (!fs_1.default.existsSync(dirPath)) {
            finalDirPath = path_1.default.join(__dirname, `out/${id}/build`);
        }
        else {
            finalDirPath = path_1.default.join(__dirname, `out/${id}/dist`);
        }
        const allFiles = getAllFiles(finalDirPath);
        allFiles.forEach((file) => __awaiter(this, void 0, void 0, function* () {
            yield uploadFile(`dist/${id}/` + file.slice(finalDirPath.length + 1), file);
        }));
    });
}
exports.storeDistDir = storeDistDir;
function getAllFiles(dir) {
    let response = [];
    const allPaths = fs_1.default.readdirSync(dir);
    allPaths.forEach((file) => {
        const fullPath = path_1.default.join(dir, file);
        if (fs_1.default.statSync(fullPath).isDirectory()) {
            response = response.concat(getAllFiles(fullPath));
        }
        else {
            response.push(fullPath);
        }
    });
    return response;
}
function uploadFile(fileName, localFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = fs_1.default.readFileSync(localFilePath);
        const { data, error } = yield supabase.storage
            .from("vercel")
            .upload(`${fileName}`, content, {
            cacheControl: "3600",
            upsert: false,
        });
        if (error !== null) {
            console.error(error);
        }
        console.log(data);
    });
}
