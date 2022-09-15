export function validateValue (value: { [key: string]: any }): boolean  {
    try {
        const regExText = "('(''|[^'])*')|(;)|(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)";
        const keys = Object.keys(value);
        const values = keys.map(key => value[key]);
        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] === 'string') {
                if (values[i].match(new RegExp(regExText))) {
                    return false;
                }
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}