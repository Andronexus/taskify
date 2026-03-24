import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toSafeJSON(): {
        id: number;
        username: string;
        email: string;
        createdAt?: Date;
        updatedAt?: Date;
    };
}
export default User;
//# sourceMappingURL=User.d.ts.map