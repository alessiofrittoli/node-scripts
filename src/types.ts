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
 * Namespace containing types related to publish options.
 */
export namespace Publish
{
	/**
	 * Type representing possible publish options.
	 */
	export type Option = (
		| '--verbose'
		| '--version'
		| '--v'
		| '--access'
		| '--origin'
		| '--o'
		| '--npm'
		| '--build'
	)

	/**
	 * Type representing the value associated with a specific publish option.
	 * 
	 * @template T - The publish option type.
	 */
	export type OptionValue<T extends Option> = (
		T extends '--verbose'
		? null
		: T extends '--build'
		? string
		: T extends '--access'
		? NodeJS.Process.ArgvValue<'public' | 'restricted'>
		: NodeJS.Process.ArgvValue
	)

	/**
	 * Interface representing a map of publish options to their values.
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
		 * @type T | 'true' - The argument value can be of type `T` or `'true'`.
		 */
		export type ArgvValue<T = string> = T | 'true'
	}

	export interface GlobalPackage
	{
		version?: string
		overridden: boolean
		problems?: string[]
	}


	export interface LocalPackage extends GlobalPackage
	{
		resolved: string
		extraneous?: boolean
	}

	export namespace Deps
	{
		export interface Global
		{
			name?: string
			dependencies?: Record<string, GlobalPackage>
		}

		export interface Local extends Global, Omit<LocalPackage, 'extraneous' | 'overridden' | 'resolved'>
		{
			dependencies?: Record<string, LocalPackage>
		}
	}
}


/**
 * Namespace containing Git-related types.
 */
export namespace Git
{
	/**
	 * Namespace containing types and interfaces related to remote operations.
	 */
	export namespace Remote
	{
		/**
		 * Type representing the kind of remote url type.
		 * - 'fetch': Represents a fetch operation.
		 * - 'push': Represents a push operation.
		 */
		export type Type = 'fetch' | 'push'


		/**
		 * Type representing a map of url types to their corresponding URLs.
		 */
		export type Urls = globalThis.Map<Git.Remote.Type, string>

		
		/**
		 * Union type representing the possible keys for the Git.Remote.Map.
		 * - 'name': Represents the name key.
		 * - 'urls': Represents the URLs key.
		 */
		export type MapKey = 'name' | 'urls'


		/**
		 * Conditional type that maps a Remote.MapKey to its corresponding value type.
		 * - If T is 'urls', the value type is Remote.Urls.
		 * - If T is 'name', the value type is string.
		 * - Otherwise, the value type is never.
		 */
		export type MapValue<T extends Remote.MapKey> = (
			T extends 'urls'
				? Remote.Urls
			: T extends 'name'
				? string
			: never
		)
		
		
		/**
		 * Interface representing a map with keys of type Remote.MapKey and values of type Remote.MapValue.
		 * Extends the global Map interface.
		 * 
		 * @template K - The type of the keys in the map. Defaults to Remote.MapKey.
		 */
		export interface Map<
			K extends Remote.MapKey = Remote.MapKey
		> extends globalThis.Map<K, Remote.MapValue<K>>
		{
			/**
			 * Executes a provided function once per each key/value pair in the Map, in insertion order.
			 */
			forEach<
				K extends Remote.MapKey = Remote.MapKey,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			>( callbackfn: ( value: Remote.MapValue<K>, key: K, map: globalThis.Map<K, Remote.MapValue<K>> ) => void, thisArg?: any ): void
			/**
			  * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
			  * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
			  */
			get<
				K extends Remote.MapKey = Remote.MapKey,
			>( key: K ): Remote.MapValue<K> | undefined
			/**
			 * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
			 */
			set<
				K extends Remote.MapKey = Remote.MapKey,
			>( key: K, value: Remote.MapValue<K> ): this
		}
	}


	/**
	 * Represents a Git stash.
	 */
	export interface Stash
	{
		/**
		 * The index of the stash.
		 */
		index: number

		/**
		 * The branch associated with the stash.
		 */
		branch: string

		/**
		 * The name of the stash, or null if not named.
		 */
		name: string | null
	}

	/**
	 * Options for retrieving a stash by either index or name.
	 */
	export type GetStashByOptions = (
		| {
			/**
			 * The index of the stash to retrieve.
			 */
			index: NonNullable<Git.Stash['index']>
		}
		| {
			/**
			 * The name of the stash to retrieve.
			 */
			name: NonNullable<Git.Stash['name']>
		}
	)
}