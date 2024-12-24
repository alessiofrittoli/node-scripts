/**
 * Represents a package in the project.
 */
export interface Package
{
	/** The root directory of the project. */
	root: string
	/** The name of the project. */
	name: string
}

/**
 * Namespace containing types related to release options.
 */
export namespace Release
{
	/**
	 * Type representing possible release options.
	 */
	export type Option = (
		| '--verbose'
		| '--version'
		| '--v'
		| '--access'
		| '--origin'
		| '--o'
		| '--npm'
	)

	/**
	 * Type representing the value associated with a specific release option.
	 * 
	 * @template T - The release option type.
	 */
	export type OptionValue<T extends Option> = (
		T extends '--verbose'
		? null
		: T extends '--access'
		? NodeJS.Process.ArgvValue<'public' | 'restricted'>
		: NodeJS.Process.ArgvValue
	)

	/**
	 * Interface representing a map of release options to their values.
	 */
	export interface OptionsMap extends Map<Option, OptionValue<Option>>
	{
		/**
		 * Executes a provided function once per each key/value pair in the Map, in insertion order.
		 * 
		 * @param callbackfn - Function to execute for each element.
		 * @param thisArg - Value to use as `this` when executing `callbackfn`.
		 */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		forEach<K extends Option, V extends OptionValue<K>>( callbackfn: ( value: V, key: K, map: Map<K, V> ) => void, thisArg?: any ): void

		/**
		 * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
		 * 
		 * @param key - The key of the element to return.
		 * @returns The element associated with the specified key. If no element is associated with the specified key, `undefined` is returned.
		 */
		get<K extends Option, V extends OptionValue<K>>( key: K ): V | undefined

		/**
		 * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
		 * 
		 * @param key - The key of the element to add.
		 * @param value - The value of the element to add.
		 * @returns The Map object.
		 */
		set<K extends Option, V extends OptionValue<K>>( key: K, value: V ): this
	}
}

/**
 * Namespace for NodeJS related types.
 */
export namespace NodeJS
{
	/**
	 * Namespace for Process related types.
	 */
	export namespace Process
	{
		/**
		 * Type representing a value in the process arguments.
		 * 
		 * @template T - The type of the argument value, defaults to `string`.
		 * @type T | null - The argument value can be of type `T` or `null`.
		 */
		export type ArgvValue<T = string> = T | null
	}
}