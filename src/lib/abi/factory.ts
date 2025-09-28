import FactoryAbi from '@/abi/FlywheelContract.json';

export const FACTORY_ADDRESS = (process.env.FACTORY_ADDRESS ?? '0x6Ecc3d9F4e738A32057Bd5ED61903EaF0681cD23') as `0x${string}`;

export const ActionManagerFactoryAbi = FactoryAbi as unknown as readonly { type: string }[];


