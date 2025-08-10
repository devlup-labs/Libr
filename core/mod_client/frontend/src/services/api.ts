import { SendInput,FetchAll,GenerateAvatar,GenerateAlias,GetModerationLogs,GetModConfig,SaveModConfig,ModAuthentication,SaveGoogleApiKey,ManualModerate,FetchMessageReports } from "../../wailsjs/go/main/App"; 
import axios from 'axios';
import { Community, Message, User, ModLogEntry, useAppStore,ReportedMessage } from '../store/useAppStore';
import {types} from '../../wailsjs/go/models'
import {emojify} from 'node-emoji';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Mock data for demo purposes
const mockCommunities: Community[] = [
  {
    id: '0',
    name: 'libr',
    topic: '',
    memberCount: 1247,
    isJoined: true,
    requiresApproval: false,
  },
  {
    id: '1',
    name: 'cryptography',
    topic: 'Discussion about cryptographic protocols and implementations',
    memberCount: 1247,
    isJoined: false,
    requiresApproval: false,
  },
  {
    id: '2',
    name: 'privacy-tech',
    topic: 'Privacy technologies and digital rights',
    memberCount: 892,
    isJoined: false,
    requiresApproval: false,
  },
  {
    id: '3',
    name: 'decentralized-web',
    topic: 'Building the decentralized internet',
    memberCount: 567,
    isJoined: false,
    requiresApproval: true,
  },
  {
    id: '4',
    name: 'blockchain-dev',
    topic: 'Blockchain development and smart contracts',
    memberCount: 2341,
    isJoined: false,
    requiresApproval: false,
  },
  {
    id: '5',
    name: 'web3-gaming',
    topic: 'Web3 gaming and NFT discussions',
    memberCount: 876,
    isJoined: false,
    requiresApproval: true,
  },
  {
    id: '6',
    name: 'defi-protocols',
    topic: 'Decentralized Finance protocols and analysis',
    memberCount: 1654,
    isJoined: false,
    requiresApproval: false,
  },
  {
    id: '7',
    name: 'zero-knowledge',
    topic: 'Zero-knowledge proofs and privacy solutions',
    memberCount: 432,
    isJoined: false,
    requiresApproval: true,
  },
  {
    id: '8',
    name: 'dao-governance',
    topic: 'DAO governance and tokenomics',
    memberCount: 987,
    isJoined: false,
    requiresApproval: false,
  },
  {
    id: '9',
    name: 'layer2-scaling',
    topic: 'Layer 2 scaling solutions and optimizations',
    memberCount: 723,
    isJoined: false,
    requiresApproval: true,
  },
  {
    id: '10',
    name: 'censorship-resistance',
    topic: 'Building censorship-resistant systems',
    memberCount: 1123,
    isJoined: false,
    requiresApproval: false,
  },
  {
    id: '11',
    name: 'peer-to-peer',
    topic: 'P2P networking and distributed systems',
    memberCount: 645,
    isJoined: false,
    requiresApproval: true,
  },
  {
    id: '12',
    name: 'digital-identity',
    topic: 'Self-sovereign identity and digital credentials',
    memberCount: 498,
    isJoined: false,
    requiresApproval: false,
  },
];

const messageCache: { [sign: string]: Message } = {};

export const apiService = {
  // Auth
  async authenticate(publicKey: string): Promise<User> {
    const avatar= await GenerateAvatar(publicKey)
    const alias=await GenerateAlias(publicKey)
    const isMod=await ModAuthentication(publicKey)
    const role: 'member' | 'moderator' | 'admin' = isMod ? 'moderator' : 'member';
    return {
      publicKey,
      alias,
      role, 
      avatarSvg:avatar,
    };
  },

  // Communities
  async getCommunities(): Promise<Community[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCommunities;
  },

  async joinCommunity(communityId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Joined community: ${communityId}`);
  },

  // Messages
  async getMessages(_communityId: string): Promise<Message[]> {
    try {
      const fetched = await FetchAll();
      for (const message of fetched) {
        const alias = await GenerateAlias(message.public_key);
        const svg = await GenerateAvatar(message.public_key);
        const msg: Message = {
          content: message.msg.content,
          authorAlias: alias,
          authorPublicKey: message.public_key,
          timestamp: BigInt(message.msg.ts),
          communityId: "1",
          status: "approved",
          moderationNote: message.mod_certs,
          avatarSvg: svg,
          sign: message.sign,
        };
        messageCache[msg.sign] = msg;
      }
      return Object.values(messageCache).sort((a, b) => Number(b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return Object.values(messageCache).sort((a, b) => Number(b.timestamp - a.timestamp));
    }
  },

  async getMessageReports(_communityId: string): Promise<ReportedMessage[]> {
    try {
      const reports = await FetchMessageReports();
      return reports.map((msg: any) => ({
        content: msg.content,
        authorPublicKey: msg.authorPublicKey,
        authorAlias: msg.authorAlias,
        timestamp: BigInt(msg.timestamp),
        communityId: msg.communityId,
        status: msg.status,
        moderationNote: msg.moderationNote, 
        avatarSvg: msg.avatarSvg,
        sign: msg.sign,
        note: msg.note
      }));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return [];
    }
  },
  
  async manualModerate(sign:string, modsign:string, moderated: number): Promise<void> {
    try {
      await ManualModerate(sign, modsign, moderated);
    }catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  },

  async sendMessage(communityId: string, content: string): Promise<Message> {
    let response: string = '';
    let modcerts: types.ModCert[] = [];

    const result = await SendInput(content);

    if (typeof result === 'string') {
      response = result;
    } else if (Array.isArray(result)) {
      modcerts = result;
    }

    const approved = response.includes("Sent");
    const rejected = response.includes("rejected");
    const timeout = response.includes("timeout");

    const user = useAppStore.getState().user;
    const signMatch = response.match(/Sign:\s*(\S+)/);
    const tsMatch = response.match(/Time:\s*(\d+)/);

    const newMessage: Message = {
      content,
      authorPublicKey: user.publicKey,
      authorAlias: user.alias,
      timestamp: BigInt(tsMatch?.[1] ?? Date.now()),
      communityId,
      status: approved ? 'approved' : timeout ? 'pending' : 'rejected',
      avatarSvg: user.avatarSvg,
      moderationNote: modcerts,
      sign: signMatch?.[1] ?? '',
    };

    return newMessage;
  },

  // Moderation
  async getModerationLogs():Promise<ModLogEntry[]> {
    const logs = await GetModerationLogs();
    return logs;
  },

  async moderateMessage(action: 'approve' | 'reject', note?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Message ${action}ed with note: ${note}`);
  },

  async GetModConfig():Promise<{ forbidden: string[]; thresholds: string }>{
    return await GetModConfig();
  },

  async SaveModConfig(data: { forbidden: string[]; thresholds: string }):Promise<void>{
    await SaveModConfig(data)
  },

  async SaveGoogleApiKey(key: string){
    await SaveGoogleApiKey(key)
  }
};

export function parseFormatting(text: string): string {
  // Escape HTML to prevent injection
  const escapeHTML = (str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;');

  // Apply emoji replacements first
  let formatted = emojify(text);

  // Code blocks (```...```)
  formatted = formatted.replace(/```([\s\S]*?)```/g, (_match, code) => {
    return `<pre class="bg-muted rounded p-2 overflow-x-auto my-2 text-xs"><code>${escapeHTML(code)}</code></pre>`;
  });

  // Inline code (`...`)
  formatted = formatted.replace(/`([^`\n]+?)`/g, (_match, code) => {
    return `<code class="bg-muted px-1 rounded text-xs">${escapeHTML(code)}</code>`;
  });

  // Bold (**bold**)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic (*italic*)
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Underline (_underline_)
  formatted = formatted.replace(/_(.+?)_/g, '<u>$1</u>');

  // Strikethrough (~strike~)
  formatted = formatted.replace(/~(.+?)~/g, '<s>$1</s>');

  // Newlines to <br/>
  formatted = formatted.replace(/\n/g, '<br/>');

  return formatted;
}