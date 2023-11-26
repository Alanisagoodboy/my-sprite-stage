
/**
 * 生成一个用不重复的ID
 */
import { customAlphabet } from 'nanoid'
export default function GenNonDuplicateID() {
  return customAlphabet('ABCDEF1234567890', 5)()
}
