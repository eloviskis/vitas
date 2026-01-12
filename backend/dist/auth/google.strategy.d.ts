import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
declare const GoogleStrategy_base: new (...args: any[]) => Strategy;
export declare class GoogleStrategy extends GoogleStrategy_base {
    private userRepository;
    constructor(userRepository: Repository<User>);
    validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any>;
}
export {};
