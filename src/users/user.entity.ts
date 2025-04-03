import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Cart } from '../cart/cart.entity';
  import { Order } from '../order/order.entity';
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'varchar',
      length: 255,
      unique: true,
    })
    email: string;
  
    @Column({
      type: 'varchar',
      length: 255,
    })
    password: string;
  
    @CreateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_DATE',
    })
    created_at: Date;
  
    @UpdateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_DATE',
    })
    updated_at: Date;
  }