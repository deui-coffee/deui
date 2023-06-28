import tw from 'twin.macro'

/**
 * Test component for easy prototyping. Replace onClick with something and there u go,
 * u have a button for it.
 */
export default function Debug() {
    const onClick = undefined

    return (
        onClick && (
            <div
                css={tw`
                rounded-lg
                fixed
                left-6
                top-6
                bg-white
                shadow-2xl
                p-10
            `}
            >
                <button
                    type="button"
                    onClick={onClick}
                    css={tw`appearance-none bg-blue px-4 py-2 rounded-md shadow-sm`}
                >
                    Submit
                </button>
            </div>
        )
    )
}
